import backend.db_utils as db_utils
import pandas as pd

print("Testing Supabase Connection...")
try:
    client = db_utils.get_supabase_client()
    print("Client created.")
    
    print("Testing WRITE Permission (RLS)...")
    try:
        # Use our robust function
        import random
        from datetime import datetime
        
        test_record = {
            'TransactionID': random.randint(100000, 999999), # Random ID to avoid collision
            'Timestamp': datetime.now(),
            'Quantity': 1,
            'PricePerUnit': 10.0,
            'TotalPrice': 10.0,
            'Region': 'North',
            'Channel': 'Test'
        }
        
        print("Attempting db_utils.insert_transaction()...")
        success = db_utils.insert_transaction(test_record)
        
        if success:
            print("SUCCESS: Record inserted! RLS Policy is valid.")
        else:
            print("FAILURE: database insert failed (See error above).")
            
    except Exception as e:
        print(f"Write Test Failed: {e}")
except Exception as e:
    print(f"CRITICAL FAILURE: {e}")
    import traceback
    traceback.print_exc()
