import os
import time
import pandas as pd
from supabase import create_client, Client


# Configuration
SUPABASE_URL = "https://nqhevfseowjpdtzibgew.supabase.co"
# Using the provided key
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xaGV2ZnNlb3dqcGR0emliZ2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjM2NjksImV4cCI6MjA4MDgzOTY2OX0.OyyxwbGTOLwYXMMjQKy2jmZA3GYZzyLXAapO9sN-3CA"
CSV_FILE = "sales_transactions.csv"
TABLE_NAME = "sales_data"


def get_supabase_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)

import random
from datetime import datetime, timedelta

def initialize_db_if_empty(supabase):
    """Checks if table is empty and seeds it if necessary."""
    try:
        # Check count
        response = supabase.table(TABLE_NAME).select("TransactionID", count="exact").limit(1).execute()
        count = response.count
        
        if count is not None and count > 0:
            return # Already has data
            
        print("Database is empty. Seeding initial data...")
        # Simple generation logic to avoid importing transaction.py (Circular import risk)
        initial_data = []
        for i in range(50): # Generate 50 initial records
            initial_data.append({
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
            })
            
        supabase.table(TABLE_NAME).insert(initial_data).execute()
        print("Seeding complete.")
        
    except Exception as e:
        print(f"Error seeding DB: {e}")

def fetch_all_transactions():
    """Fetches all records from sales_data table and returns as a DataFrame."""
    try:
        supabase = get_supabase_client()
        
        # Auto-seed if empty
        initialize_db_if_empty(supabase)
        
        # Supabase limits fetch to 1000 by default, we might need pagination for huge datasets
        # For now, let's grab the last 2000 records to keep it fast
        response = supabase.table(TABLE_NAME).select("*").order("Timestamp", desc=True).limit(2000).execute()
        data = response.data
        if not data:
            return pd.DataFrame()
            
        df = pd.DataFrame(data)
        # Ensure timestamp is datetime
        df['Timestamp'] = pd.to_datetime(df['Timestamp'])
        return df
    except Exception as e:
        print(f"Error fetching data from Supabase: {e}")
        return pd.DataFrame()

def insert_transaction(record):
    """Inserts a single transaction record."""
    try:
        supabase = get_supabase_client()
        # Ensure timestamp is string for JSON serialization
        if hasattr(record['Timestamp'], 'isoformat'):
            record['Timestamp'] = record['Timestamp'].isoformat()
            
        supabase.table(TABLE_NAME).insert(record).execute()
        return True
    except Exception as e:
        print(f"Error inserting transaction: {e}")
        return False

# For Restock, we will simulate persistence or use a simple hack. 
# Since we might not have a 'restock' table, we will skip persistence for restock in this "host-friendly" version
# OR we can assume a 'restock_log' table exists. 
# Let's stick to in-memory for restock/status on Vercel as they are less critical for "Smooth Running" (Display)
# than the main Sales Data.


