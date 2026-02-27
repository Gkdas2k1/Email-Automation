import pandas as pd
import sys

file_path = 'Test Mail.xlsx'

try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("\nFirst 5 rows:")
    print(df.head().to_string())
    sys.stdout.flush()
except Exception as e:
    print(f"Error: {e}")
    sys.stdout.flush()
