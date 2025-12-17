import os
import time
import pandas as pd
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None
    Client = None
import random
from datetime import datetime, timedelta

# Configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://nqhevfseowjpdtzibgew.supabase.co")
# Using the provided key or env var. 
# NOTE: In production/Vercel, you MUST set message SUPABASE_KEY in environment variables.
# The key below is a fallback (Public Anon Key provided by user)
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "sb_publishable_bysiJIf5J3EiN0RHg0Y7xA_-4HZbncQ")

TABLE_NAME = "sales_data"
RESTOCK_TABLE = "restock_logs"
PIPELINE_TABLE = "pipeline_status"

def get_supabase_client():
    if create_client:
        try:
            return create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"Error creating Supabase client: {e}")
            return None
    return None

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

# Wears / Clothing Items (Same as transaction.py)
WEARS = [
    "Classic White T-Shirt", "Slim Fit Denim Jeans", "Oversized Hoodie", "Running Sneakers", 
    "Leather Biker Jacket", "Baseball Cap", "Cotton Crew Socks", "Cargo Shorts", 
    "Summer Floral Dress", "Wool Knit Sweater", "Ankle Boots", "Silk Scarf",
    "Puffer Jacket", "Yoga Leggings", "Formal Blazer", "Chino Pants",
    "Maxi Skirt", "Aviator Sunglasses", "Leather Belt", "Beanie Hat"
]

def initialize_db_if_empty(supabase):
    """Checks if table is empty and seeds it. Also fixes generic names if found."""
    try:
        # Check if we need to fix generic names (Product 1, Product 2...)
        # We check TransactionID 1. If it exists and ProductID is 'Product 0', we overwrite the seed data.
        response = supabase.table(TABLE_NAME).select("*").eq("TransactionID", 1).limit(1).execute()
        
        need_reseed = False
        if not response.data:
            print("Database is empty. Seeding...")
            need_reseed = True
        else:
            first_product = response.data[0].get('product_id') or response.data[0].get('ProductID')
            if first_product and str(first_product).startswith("Product "):
                print("Found generic product names. Overwriting with real names...")
                need_reseed = True
                
        if need_reseed:
            initial_data = []
            for i in range(50): 
                # Create Pascal Record
                record = {
                    'TransactionID': i + 1,
                    # Spread out dates
                    'Timestamp': (datetime.now() - timedelta(minutes=50-i)).strftime('%Y-%m-%d %H:%M:%S'),
                    # Use REAL name
                    'ProductID': WEARS[i % len(WEARS)],
                    'Quantity': random.randint(1, 5),
                    'PricePerUnit': 50.0,
                    'TotalPrice': random.randint(1, 5) * 50.0,
                    'Region': random.choice(['North', 'South', 'East', 'West']),
                    'Channel': 'Webstore'
                }
                # Convert to DB Schema
                initial_data.append(map_record_to_db_schema(record))
                
            supabase.table(TABLE_NAME).upsert(initial_data).execute()
            print("Seeding/Fix complete.")
            
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

def add_restock_record(product_id, quantity):
    """Logs a restock event to Supabase."""
    try:
        supabase = get_supabase_client()
        data = {
            "product_id": product_id,
            "quantity": quantity,
            "timestamp": datetime.now().isoformat()
        }
        supabase.table(RESTOCK_TABLE).insert(data).execute()
        return True
    except Exception as e:
        print(f"Error adding restock record: {e}")
        return False

def get_restock_data():
    """Aggregates total restocked quantity per product from logs."""
    try:
        supabase = get_supabase_client()
        # Fetch all restock logs
        response = supabase.table(RESTOCK_TABLE).select("*").execute()
        data = response.data
        
        restock_map = {}
        for row in data:
            pid = row.get('product_id')
            qty = row.get('quantity', 0)
            restock_map[pid] = restock_map.get(pid, 0) + qty
            
        return restock_map
    except Exception as e:
        print(f"Error fetching restock data: {e}")
        return {}

def get_pipeline_status():
    """Gets the active status of the pipeline."""
    try:
        supabase = get_supabase_client()
        # We assume ID 1 is the status row
        response = supabase.table(PIPELINE_TABLE).select("active").eq("id", 1).single().execute()
        if response.data:
            return response.data.get('active', True)
        return True
    except Exception as e:
        print(f"Error getting pipeline status: {e}")
        # Default to True if table missing or error, so it doesn't break
        return True

def set_pipeline_status(active):
    """Updates the pipeline status."""
    try:
        supabase = get_supabase_client()
        # Upsert ID 1
        data = {
            "id": 1,
            "active": active,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table(PIPELINE_TABLE).upsert(data).execute()
        return True
    except Exception as e:
        print(f"Error setting pipeline status: {e}")
        return False
