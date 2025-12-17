import pandas as pd
try:
    df = pd.read_csv('backend/sales_transactions.csv')
    print("Unique Channels:", df['Channel'].unique())
    
    channel_sales = df.groupby('Channel')['TotalPrice'].sum().reset_index()
    print("Aggregated Sales List:")
    for index, row in channel_sales.iterrows():
        print(f"{row['Channel']}: {row['TotalPrice']}")
except Exception as e:
    print(e)
