import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# print("Libraries imported successfully.")

num_initial_transactions = 100
num_products = 50
min_price = 10.0
max_price = 500.0
regions = ['North', 'South', 'East', 'West', 'Central']

# print("Data generation parameters defined.")

def generate_single_transaction(transaction_id, current_time):
    product_id = f"p{np.random.randint(1, num_products + 1):03d}"
    quantity = np.random.randint(1, 10)
    price_per_unit = round(np.random.uniform(min_price, max_price), 2)
    total_price = round(quantity * price_per_unit, 2)
    region = np.random.choice(regions)

    return {
        'TransactionID': transaction_id,
        'Timestamp': current_time,
        'ProductID': product_id,
        'Quantity': quantity,
        'PricePerUnit': price_per_unit,
        'TotalPrice': total_price,
        'Region': region
    }

# print("Function 'generate_single_transaction' defined.")

initial_transactions_list = []
current_time = datetime.now()
for i in range(num_initial_transactions):
    initial_transactions_list.append(generate_single_transaction(i + 1, current_time - timedelta(minutes=num_initial_transactions - 1 - i)))

sales_df = pd.DataFrame(initial_transactions_list)
# print(f"Generated {len(sales_df)} initial transactions.")
# print(sales_df.head())

csv_filename = 'sales_transactions.csv'

def generate_and_save_new_transaction(df, last_transaction_id):
    new_transaction_id = last_transaction_id + 1
    current_time = datetime.now()
    new_transaction = generate_single_transaction(new_transaction_id, current_time)
    
    # Convert the new transaction to a DataFrame and concatenate
    new_df_row = pd.DataFrame([new_transaction])
    updated_df = pd.concat([df, new_df_row], ignore_index=True)
    
    # Save the updated DataFrame to CSV, overwriting the previous file
    updated_df.to_csv(csv_filename, index=False)
    
    print(f"Generated and saved transaction {new_transaction_id} to {csv_filename}")
    return updated_df, new_transaction_id

# Save the initial DataFrame to the CSV file
sales_df.to_csv(csv_filename, index=False)
# print(f"Initial sales data saved to {csv_filename}")
# print("Function 'generate_and_save_new_transaction' defined.")

import time

# Get the last transaction ID from the initial DataFrame
last_transaction_id = sales_df['TransactionID'].max()

# Simulate real-time data arrival for a few new transactions
num_new_transactions = 5
simulation_interval_seconds = 1 # Simulate new transaction every 1 second

print(f"Simulating real-time data arrival for {num_new_transactions} new transactions...")

for _ in range(num_new_transactions):
    sales_df, last_transaction_id = generate_and_save_new_transaction(sales_df, last_transaction_id)
    time.sleep(simulation_interval_seconds)

# print("Real-time data simulation complete. Final DataFrame head:")
# print(sales_df.tail())


sales_df = pd.read_csv(csv_filename, parse_dates=['Timestamp'])
# print(f"Sales data loaded from {csv_filename}. Head of the DataFrame:")
# print(sales_df.head())
# print(sales_df.info())

product_sales = sales_df.groupby('ProductID').agg(
    TotalSales=('TotalPrice', 'sum'),
    TotalQuantitySold=('Quantity', 'sum')
).reset_index()
# print("Product Sales (head):")
# print(product_sales.head())
# print("\n")

sales_df['Date'] = sales_df['Timestamp'].dt.date
daily_sales = sales_df.groupby('Date').agg(
    DailySales=('TotalPrice', 'sum'),
    DailyQuantitySold=('Quantity', 'sum')
).reset_index()
# print("Daily Sales (head):")
# print(daily_sales.head())
# print("\n")

regional_sales = sales_df.groupby('Region').agg(
    TotalSales=('TotalPrice', 'sum')
).reset_index()
# print("Regional Sales (head):")
# print(regional_sales.head())


top_products_sales = product_sales.sort_values(by='TotalSales', ascending=False).head(10).reset_index(drop=True)
# print("Top 10 Product Sales (head):")
# print(top_products_sales)
# print("\n")

daily_sales = daily_sales.sort_values(by='Date', ascending=True).reset_index(drop=True)
# print("Daily Sales (sorted by Date - head):")
# print(daily_sales.head())
# print("\n")

regional_sales = regional_sales.sort_values(by='TotalSales', ascending=False).reset_index(drop=True)
# print("Regional Sales (sorted by TotalSales - head):")
# print(regional_sales.head())

import matplotlib.pyplot as plt
import seaborn as sns

# print("Visualization libraries imported successfully.")

plt.figure(figsize=(18, 6))

# Plot 1: Top 10 Products by Total Sales (Bar Chart)
plt.subplot(1, 3, 1) # 1 row, 3 columns, 1st plot
sns.barplot(x='ProductID', y='TotalSales', data=top_products_sales, palette='viridis')
plt.title('Top 10 Products by Total Sales')
plt.xlabel('Product ID')
plt.ylabel('Total Sales')
plt.xticks(rotation=45, ha='right')

# Plot 2: Daily Sales Trend (Line Chart)
plt.subplot(1, 3, 2) # 1 row, 3 columns, 2nd plot
sns.lineplot(x='Date', y='DailySales', data=daily_sales, marker='o', color='blue')
plt.title('Daily Sales Trend')
plt.xlabel('Date')
plt.ylabel('Daily Sales')
plt.xticks(rotation=45, ha='right')

# Plot 3: Sales Distribution by Region (Pie Chart)
plt.subplot(1, 3, 3) # 1 row, 3 columns, 3rd plot
plt.pie(regional_sales['TotalSales'], labels=regional_sales['Region'], autopct='%1.1f%%', startangle=90, colors=sns.color_palette('pastel'))
plt.title('Sales Distribution by Region')
plt.axis('equal') # Equal aspect ratio ensures that pie is drawn as a circle.

plt.tight_layout()
plt.show()

# print("Generated sales dashboard visualizations.")


import time
import streamlit as st
import plotly.express as px
import duckdb
# print("Streamlit and Plotly libraries imported successfully.")
# Function to get data from DuckDB
def get_data():
    con = duckdb.connect(database=':memory:')
    con.execute("""
        CREATE TABLE sales_fact AS 
        SELECT 
            TransactionID as transaction_id,
            Timestamp as timestamp,
            ProductID as product,
            Quantity as quantity,
            PricePerUnit as price_per_unit,
            TotalPrice as total_amount,
            Region as region
        FROM read_csv_auto('sales_transactions.csv')
    """)
    
    # Total Sales KPI
    total_sales = con.execute("""
        SELECT SUM(total_amount) as total_revenue 
        FROM sales_fact
    """).fetchone()[0]
    
    # Chart 1: Sales by Store
    sales_by_store = con.execute("""
        SELECT store_id, SUM(total_amount) as revenue 
        FROM sales_fact 
        GROUP BY store_id 
        ORDER BY revenue DESC
    """).fetchdf()
    
    # Chart 2: Recent Trend (Last 50 transactions)
    recent_trend = con.execute("""
        SELECT timestamp, total_amount, product 
        FROM sales_fact 
        ORDER BY timestamp DESC 
        LIMIT 50
    """).fetchdf()
    
    con.close()
    return total_sales, sales_by_store, recent_trend
# print("Function 'get_data' defined.")
st.set_page_config(page_title="Real-Time Sales Dashboard", layout="wide")
st.title("📊 Real-Time Sales Aggregation Pipeline")
# Placeholder for auto-refresh
placeholder = st.empty()
# Refresh loop
while True:
    total_sales, df_store, df_trend = get_data()
    
    with placeholder.container():
        if df_store.empty:
            st.warning("Waiting for pipeline to generate data...")
        else:
            # KPIS
            kpi1, kpi2 = st.columns(2)
            kpi1.metric(label="Total Revenue", value=f"${total_sales:,.2f}")
            kpi2.metric(label="Transactions Logged", value=len(df_trend))
            
            # Charts
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("Sales by Store")
                fig1 = px.bar(df_store, x='store_id', y='revenue', labels={'store_id': 'Store ID', 'revenue': 'Revenue'}, title='Sales by Store')
                st.plotly_chart(fig1, use_container_width=True)
            
            with col2:
                st.subheader("Recent Sales Trend")
                fig2 = px.line(df_trend.sort_values(by='timestamp'), x='timestamp', y='total_amount', color='product', labels={'timestamp': 'Timestamp', 'total_amount': 'Total Amount', 'product': 'Product'}, title='Recent Sales Trend (Last 50 Transactions)')
                st.plotly_chart(fig2, use_container_width=True)
    
    time.sleep(5)  # Refresh every 5 seconds
    break
import time
import streamlit as st
import plotly.express as px
import duckdb

# --- Data Retrieval Function ---
def get_data():
    con = duckdb.connect(database=':memory:')
    con.execute("""
        CREATE TABLE sales_fact AS 
        SELECT 
            TransactionID as transaction_id,
            Timestamp as timestamp,
            ProductID as product,
            Quantity as quantity,
            PricePerUnit as price_per_unit,
            TotalPrice as total_amount,
            Region as region
        FROM read_csv_auto('sales_transactions.csv')
    """)
    
    # Check if table is empty
    count = con.execute("SELECT COUNT(*) FROM sales_fact").fetchone()[0]
    if count == 0:
        con.close()
        return None, None, None
    
# KPI: Total Revenue
total_sales = con.execute("SELECT SUM(total_amount) FROM sales_fact").fetchone()[0]
# Chart 1: Sales by Store
sales_by_store = con.execute("""
    SELECT store_id, SUM(total_amount) as revenue 
    FROM sales_fact 
    GROUP BY store_id 
    ORDER BY revenue DESC
""").fetchdf()
# Chart 2: Recent Trend (Last 50 transactions)
recent_trend = con.execute(""" 
    SELECT timestamp, total_amount, product
    FROM sales_fact 
    ORDER BY timestamp DESC
    LIMIT 50
""").fetchdf()
con.close()
    