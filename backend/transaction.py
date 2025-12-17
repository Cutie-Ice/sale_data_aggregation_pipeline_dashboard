import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import time
import random
import json

# Configuration
CSV_FILENAME = 'sales_transactions.csv'
NUM_INITIAL_TRANSACTIONS = 100
NUM_PRODUCTS = 50
MIN_PRICE = 10.0
MAX_PRICE = 500.0
REGIONS = ['North', 'South', 'East', 'West', 'Central']

# Wears / Clothing Items
WEARS = [
    "Classic White T-Shirt", "Slim Fit Denim Jeans", "Oversized Hoodie", "Running Sneakers", 
    "Leather Biker Jacket", "Baseball Cap", "Cotton Crew Socks", "Cargo Shorts", 
    "Summer Floral Dress", "Wool Knit Sweater", "Ankle Boots", "Silk Scarf",
    "Puffer Jacket", "Yoga Leggings", "Formal Blazer", "Chino Pants",
    "Maxi Skirt", "Aviator Sunglasses", "Leather Belt", "Beanie Hat"
]

def generate_single_transaction(transaction_id, current_time):
    # product_id = f"p{np.random.randint(1, NUM_PRODUCTS + 1):03d}"
    # Use real product names now
    product_name = np.random.choice(WEARS)
    
    quantity = np.random.randint(1, 10)
    price_per_unit = round(np.random.uniform(MIN_PRICE, MAX_PRICE), 2)
    cost_per_unit = round(price_per_unit * np.random.uniform(0.5, 0.8), 2)
    total_price = round(quantity * price_per_unit, 2)
    total_cost = round(quantity * cost_per_unit, 2)
    region = np.random.choice(REGIONS)
    channel = np.random.choice(['Webstore', 'Shop A', 'Shop B'])

    return {
        'TransactionID': int(transaction_id),
        'Timestamp': current_time,
        'ProductID': str(product_name), # Using Name as ID for simplicity in this demo
        'Quantity': int(quantity),
        'PricePerUnit': float(price_per_unit),
        'CostPerUnit': float(cost_per_unit),
        'TotalPrice': float(total_price),
        'TotalCost': float(total_cost),
        'Region': str(region),
        'Channel': str(channel)
    }

def initialize_data():
    if os.path.exists(CSV_FILENAME):
        try:
            df = pd.read_csv(CSV_FILENAME)
            # print(f"Loaded {len(df)} transactions from {CSV_FILENAME}")
            return df
        except Exception as e:
            print(f"Error reading CSV: {e}")
    
    print("Generating initial data...")
    initial_transactions_list = []
    current_time = datetime.now()
    for i in range(NUM_INITIAL_TRANSACTIONS):
        initial_transactions_list.append(generate_single_transaction(i + 1, current_time - timedelta(minutes=NUM_INITIAL_TRANSACTIONS - 1 - i)))
    
    df = pd.DataFrame(initial_transactions_list)
    df.to_csv(CSV_FILENAME, index=False)
    return df

def generate_new_transaction(df):
    last_transaction_id = df['TransactionID'].max() if not df.empty else 0
    new_transaction_id = last_transaction_id + 1
    current_time = datetime.now()
    
    new_transaction = generate_single_transaction(new_transaction_id, current_time)
    new_df_row = pd.DataFrame([new_transaction])
    
    updated_df = pd.concat([df, new_df_row], ignore_index=True)
    
    import db_utils
    # Keep file size manageable? For now just append.
    # In a real app we might append to file without rewriting everything, but for this demo rewriting is safer for concurrency if low volume.
    updated_df.to_csv(CSV_FILENAME, index=False)
    
    # Sync to Supabase
    db_utils.insert_transaction(new_transaction)
    
    return updated_df

if __name__ == "__main__":
    df = initialize_data()
    print("Starting data generation loop...")
    try:
        while True:
            # Check pipeline status
            try:
                if os.path.exists('pipeline_status.json'):
                    with open('pipeline_status.json', 'r') as f:
                        status_data = json.load(f)
                        if not status_data.get('active', True):
                            print("Pipeline is paused. Waiting...", end='\r')
                            time.sleep(2)
                            continue
            except Exception as e:
                print(f"Error reading status: {e}")

            df = generate_new_transaction(df)
            print(f"Generated transaction {df['TransactionID'].max()}               ")
            time.sleep(5)
    except KeyboardInterrupt:
        print("Stopped.")
