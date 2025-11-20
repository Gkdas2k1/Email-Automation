import pandas as pd

try:
    df = pd.read_excel('Test Mail.xlsx')
    print("Columns found:", df.columns.tolist())
    print("First few rows:\n", df.head(10))
except Exception as e:
    print(f"Error reading Excel file: {e}")
