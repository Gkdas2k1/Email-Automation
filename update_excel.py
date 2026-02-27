import pandas as pd
from datetime import datetime

file_path = 'Test Mail.xlsx'

try:
    df = pd.read_excel(file_path)
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Update first row to today and clear status to test send
    df.at[0, 'Date'] = today
    df.at[0, 'Status'] = ''
    
    df.to_excel(file_path, index=False)
    print(f"Updated first row in {file_path} to Date: {today} and cleared Status.")
except Exception as e:
    print(f"Error: {e}")
