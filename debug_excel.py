import pandas as pd
import json

file_path = 'Test Mail.xlsx'
try:
    df = pd.read_excel(file_path)
    print("COLUMNS:", df.columns.tolist())
    print("HEAD:", df.head(5).to_json(orient='records'))
except Exception as e:
    print("ERROR:", str(e))
