from flask import Flask, jsonify
from flask_cors import CORS
import datetime
import pandas as pd
import transaction
import os

app = Flask(__name__)
CORS(app)

# Ensure data is initialized
if not os.path.exists(transaction.CSV_FILENAME):
    transaction.initialize_data()

def get_data():
    # In a real app, might want to optimize reading, but for now read CSV on request or cache
    # We'll read fresh to pick up new transactions from the generator
    if os.path.exists(transaction.CSV_FILENAME):
        return pd.read_csv(transaction.CSV_FILENAME, parse_dates=['Timestamp'])
    return pd.DataFrame()

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
    last_transaction_time = df['Timestamp'].max()
    time_since_last = (datetime.datetime.now() - last_transaction_time).total_seconds()
    pipeline_status = "Active" if time_since_last < 30 else "Inactive"

    return jsonify({
        "kpi": {
            "total_revenue": total_revenue,
            "gross_profit": gross_profit,
            "profit_margin": profit_margin,
            "data_quality_alert_status": "Operational", # Mock
            "data_quality_alerts": 0,
            "pipeline_status": pipeline_status
        },
        "trends": daily_sales.to_dict(orient='records'),
        "channels": channel_sales.to_dict(orient='records'),
        "regions": regional_sales.to_dict(orient='records'),
        "products": product_stats.to_dict(orient='records')
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
