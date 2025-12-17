from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import pandas as pd
import transaction
import os
import json

app = Flask(__name__)
CORS(app)

# Ensure data is initialized


import db_utils

def get_data():
    """Fetches data from Supabase via db_utils."""
    return db_utils.fetch_all_transactions()

@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
    df = get_data()
    
    if df.empty:
        return jsonify({"error": "No data available"}), 500

    # KPIs
    total_revenue = float(df['TotalPrice'].sum())
    total_cost = float(df['TotalCost'].sum())
    gross_profit = total_revenue - total_cost
    profit_margin = (gross_profit / total_revenue * 100) if total_revenue > 0 else 0

    # Daily Trends
    df['Date'] = df['Timestamp'].dt.date.astype(str)
    daily_sales = df.groupby('Date').agg(
        Revenue=('TotalPrice', 'sum'),
        Profit=('TotalPrice', lambda x: x.sum() - df.loc[x.index, 'TotalCost'].sum())
    ).reset_index()
    
    # Channel Sales
    channel_sales = df.groupby('Channel')['TotalPrice'].sum().reset_index()
    
    # Regional Sales
    regional_sales = df.groupby('Region')['TotalPrice'].sum().reset_index()
    
    # Product Analysis (Scatter)
    product_stats = df.groupby('ProductID').agg(
        TotalSales=('TotalPrice', 'sum'),
        Totalprofit=('TotalPrice', lambda x: x.sum() - df.loc[x.index, 'TotalCost'].sum())
    ).reset_index()
    product_stats['Margin'] = (product_stats['Totalprofit'] / product_stats['TotalSales'] * 100).fillna(0)

    # Pipeline Status
    # Sort by timestamp
    df = df.sort_values(by='Timestamp', ascending=False)
    
    # Calculate time since last transaction
    last_transaction_time = df.iloc[0]['Timestamp']
    
    # Supabase returns TZ-aware, so we must make now() TZ-aware or strip TZ
    now = datetime.datetime.now()
    if last_transaction_time.tzinfo is not None:
         # Best practice: Convert 'now' to match the TZ or use UTC
         # For simplicity, let's strip TZ from the data (assuming data is roughly correct/UTC)
         last_transaction_time = last_transaction_time.replace(tzinfo=None)
         
    time_since_last = (now - last_transaction_time).total_seconds()
    # pipeline_status is now fetched from DB
    pipeline_active = db_utils.get_pipeline_status()
    pipeline_status_text = "Active" if pipeline_active else "Inactive"

    return jsonify({
        "kpi": {
            "total_revenue": total_revenue,
            "gross_profit": gross_profit,
            "profit_margin": profit_margin,
            "data_quality_alert_status": "Operational", # Mock
            "data_quality_alerts": 0,
            "pipeline_status": pipeline_status_text
        },
        "trends": daily_sales.to_dict(orient='records'),
        "channels": channel_sales.to_dict(orient='records'),
        "regions": regional_sales.to_dict(orient='records'),
        "products": product_stats.to_dict(orient='records')
    })

@app.route('/api/inventory')
def get_inventory():
    df = get_data()
    if df.empty:
        return jsonify([])
    
    # Initial Stock Base
    INITIAL_STOCK = 200
    
    # Load Restock Data from Supabase
    restock_data = db_utils.get_restock_data()

    # Calculate Sold Quantity per Product
    sold_stats = df.groupby('ProductID')['Quantity'].sum().reset_index()
    
    # Use the shared WEARS list from transaction.py
    all_product_ids = transaction.WEARS
    
    inventory_data = []
    
    # Create map for quick lookup
    sold_map = dict(zip(sold_stats['ProductID'], sold_stats['Quantity']))
    
    for pid in all_product_ids:
        sold = sold_map.get(pid, 0)
        added_stock = restock_data.get(pid, 0)
        total_initial = INITIAL_STOCK + added_stock
        remaining = total_initial - sold
        
        status = "In Stock"
        if remaining < 50: 
            status = "Low Stock"
        if remaining <= 0:
            status = "Out of Stock"
            remaining = 0 # Sustain non-negative
            
        inventory_data.append({
            "id": pid,             # Name is the ID now
            "name": pid,           # Name is the ID now
            "initial_stock": total_initial,
            "sold": int(sold),
            "remaining": int(remaining),
            "status": status,
            "status_color": "text-green-400" if status == "In Stock" else ("text-yellow-400" if status == "Low Stock" else "text-red-500")
        })
        
    # Sort by remaining stock (Ascending: 0 -> Max) to show critical items first
    inventory_data.sort(key=lambda x: x['remaining'])

    response = jsonify(inventory_data)
    response.headers.add("Cache-Control", "no-cache, no-store, must-revalidate")
    return response

@app.route('/api/inventory/restock', methods=['POST'])
def restock_product():
    data = request.json
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    
    if not product_id or quantity is None:
        return jsonify({"error": "Invalid data"}), 400
        
    try:
        quantity = int(quantity)
        if quantity <= 0:
             return jsonify({"error": "Quantity must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Invalid quantity format"}), 400

    if isinstance(quantity, str):
        try:
            quantity = int(quantity)
        except ValueError:
             return jsonify({"error": "Invalid quantity format"}), 400
             
    if quantity <= 0:
         return jsonify({"error": "Quantity must be positive"}), 400

    # Add to Supabase
    success = db_utils.add_restock_record(product_id, quantity)
    
    if success:
        return jsonify({"success": True, "message": f"Restocked {product_id}"})
    else:
        return jsonify({"error": "Failed to log restock"}), 500

@app.route('/api/best-sellers')
def get_best_sellers():
    df = get_data()
    if df.empty:
        return jsonify([])
        
    # Top 5 by Revenue
    top_products = df.groupby('ProductID')['TotalPrice'].sum().sort_values(ascending=False).head(5).reset_index()
    
    result = []
    for _, row in top_products.iterrows():
        result.append({
            "product_id": row['ProductID'],
            "revenue": float(row['TotalPrice']),
            "name": row['ProductID'] # ProductID is now the name (e.g. "Classic White T-Shirt")
        })
        
    return jsonify(result)


@app.route('/api/pipeline/status', methods=['GET', 'POST'])
def pipeline_status():
    if request.method == 'POST':
        data = request.json
        new_status = data.get('active', True)
        
        success = db_utils.set_pipeline_status(new_status)
        if success:
            return jsonify({"active": new_status, "message": "Pipeline status updated"})
        else:
            return jsonify({"error": "Failed to update status"}), 500
        
    # GET request
    active = db_utils.get_pipeline_status()
    return jsonify({"active": active})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    # Hardcoded credentials for demo
    if username == 'admin' and password == 'admin123':
        return jsonify({"success": True, "token": "demo-token-123", "user": {"username": "admin"}})
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)
