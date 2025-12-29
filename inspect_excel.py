import pandas as pd

file_path = 'Test Mail.xlsx'

try:
    df = pd.read_excel(file_path)
    
    print("=" * 70)
    print(f"📊 Excel File Inspection: {file_path}")
    print("=" * 70)
    
    print(f"\n📐 Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    
    print(f"\n📋 Columns: {df.columns.tolist()}")
    
    print("\n🔤 Data Types:")
    print(df.dtypes)
    
    print("\n❌ Null Values:")
    print(df.isnull().sum())
    
    print("\n📄 First 10 Rows:")
    print(df.head(10).to_string())
    
    print("\n" + "=" * 70)
    print("✅ Inspection Complete!")
    print("=" * 70)
    
except FileNotFoundError:
    print(f"❌ Error: File '{file_path}' not found!")
except Exception as e:
    print(f"❌ Error reading Excel file: {e}")
