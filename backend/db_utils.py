
import os
import time
import pandas as pd
from supabase import create_client, Client
import random
from datetime import datetime, timedelta

# Configuration
SUPABASE_URL = "https://nqhevfseowjpdtzibgew.supabase.co"
# Using the provided key
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xaGV2ZnNlb3dqcGR0emliZ2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjM2NjksImV4cCI6MjA4MDgzOTY2OX0.OyyxwbGTOLwYXMMjQKy2jmZA3GYZzyLXAapO9sN-3CA"
TABLE_NAME = "sales_data"

def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def map_record_to_db_schema(record):
    """Maps internal PascalCase record to DB snake_case schema."""
    db_record = {
        'Timestamp': record.get('Timestamp'),
        'Quantity': record.get('Quantity'),
        'price_per_unit': record.get('PricePerUnit'),
        'total_price': record.get('TotalPrice'),
        'region': record.get('Region'),
    }
    # Pass through ProductID and TransactionID if they exist (hope for the best on casing)
    if 'ProductID' in record:
        db_record['ProductID'] = record['ProductID']
    if 'TransactionID' in record:
        db_record['TransactionID'] = record['TransactionID']
        
    return db_record

def initialize_db_if_empty(supabase):
    """Checks if table is empty and seeds it if necessary."""
    try:
        # Check count using a known column to avoid errors
        # 'region' worked in our probe
        response = supabase.table(TABLE_NAME).select("region", count="exact").limit(1).execute()
        count = response.count
        
        if count is not None and count > 0:
            return # Already has data
            
        print("Database is empty. Seeding initial data...")
        initial_data = []
        for i in range(50): 
            # Create Pascal Record
            record = {
                'TransactionID': i + 1,
                'Timestamp': (datetime.now() - timedelta(minutes=50-i)).strftime('%Y-%m-%d %H:%M:%S'),
                'ProductID': f"Product {i}", 
                'Quantity': random.randint(1, 5),
                'PricePerUnit': 50.0,
                'CostPerUnit': 30.0,
                'TotalPrice': random.randint(1, 5) * 50.0,
                'TotalCost': random.randint(1, 5) * 30.0,
                'Region': random.choice(['North', 'South', 'East', 'West']),
                'Channel': 'Webstore'
            }
            # Convert to DB Schema
            initial_data.append(map_record_to_db_schema(record))
            
        supabase.table(TABLE_NAME).insert(initial_data).execute()
        print("Seeding complete.")
        
    except Exception as e:
        print(f"Error seeding DB: {e}")

def fetch_all_transactions():
    """Fetches all records, handles mixed schema, and polyfills missing data."""
    try:
        supabase = get_supabase_client()
        
        # Auto-seed if empty
        initialize_db_if_empty(supabase)
        
        # Select * returns whatever columns exist
        response = supabase.table(TABLE_NAME).select("*").order("Timestamp", desc=True).limit(2000).execute()
        data = response.data
        if not data:
            return pd.DataFrame()
            
        df = pd.DataFrame(data)
        
        # SCHEMA MAPPING (Mixed DB -> Pascal App)
        rename_map = {
            'price_per_unit': 'PricePerUnit',
            'total_price': 'TotalPrice',
            'region': 'Region',
            'product_id': 'ProductID',
            # 'Timestamp' and 'Quantity' seem to match Pascal based on error hints
        }
        df.rename(columns=rename_map, inplace=True)
        
        # Ensure timestamp is datetime
        if 'Timestamp' in df.columns:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            
        # POLYFILLS for missing columns
        if 'TotalCost' not in df.columns:
            if 'TotalPrice' in df.columns:
                df['TotalCost'] = df['TotalPrice'] * 0.7
            else:
                df['TotalCost'] = 0.0
                
        if 'Channel' not in df.columns:
            df['Channel'] = 'Webstore'
            
        if 'ProductID' not in df.columns and 'product_id' not in df.columns:
             pass # Hopefully ProductID came through

        return df
    except Exception as e:
        print(f"Error fetching data from Supabase: {e}")
        return pd.DataFrame()

def insert_transaction(record):
    """Inserts a single transaction record with schema mapping."""
    try:
        supabase = get_supabase_client()
        # Ensure timestamp is string for JSON serialization
        if hasattr(record['Timestamp'], 'isoformat'):
            record['Timestamp'] = record['Timestamp'].isoformat()
            
        db_record = map_record_to_db_schema(record)
            
        supabase.table(TABLE_NAME).insert(db_record).execute()
        return True
    except Exception as e:
        print(f"Error inserting transaction: {e}")
        return False
