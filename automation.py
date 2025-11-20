import win32com.client as win32
import pandas as pd
import os
import time

def send_emails():
    # Configuration
    excel_file = 'Test Mail.xlsx'
    # Get absolute path for the template to avoid Outlook issues
    msg_template_path = os.path.abspath('Customer (1) (1).msg')
    email_column = 'Mail ID'
    
    print(f"Template Path: {msg_template_path}")
    
    # Check if files exist
    if not os.path.exists(excel_file):
        print(f"Error: Excel file '{excel_file}' not found.")
        return
    if not os.path.exists(msg_template_path):
        print(f"Error: Template file '{msg_template_path}' not found.")
        return

    # Load Excel
    try:
        df = pd.read_excel(excel_file)
        print(f"Loaded {len(df)} recipients from {excel_file}")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return

    # Initialize Outlook
    try:
        outlook = win32.Dispatch('Outlook.Application')
    except Exception as e:
        print(f"Error initializing Outlook: {e}")
        return

    # Iterate and send
    for index, row in df.iterrows():
        recipient_email = row[email_column]
        
        if pd.isna(recipient_email):
            continue
            
        try:
            # Load the template for each email to ensure a fresh copy
            mail = outlook.CreateItemFromTemplate(msg_template_path)
            
            # Set recipient
            mail.To = recipient_email
            
            # Send
            mail.Send()
            print(f"[{index+1}/{len(df)}] Sent email to: {recipient_email}")
            
            # Rate limiting
            time.sleep(2) 
            
        except Exception as e:
            print(f"Failed to send to {recipient_email}: {e}")

if __name__ == "__main__":
    send_emails()
