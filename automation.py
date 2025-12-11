import win32com.client as win32
import pandas as pd
import os
import time
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    filename='automation.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def send_emails():
    # Configuration
    excel_file = 'Test Mail.xlsx'
    msg_template_path = os.path.abspath('We help companies better leverage digital and technology (1) (1).msg')
    email_column = 'Mail ID'
    date_column = 'Date'
    status_column = 'Status'
    
    print(f"Template Path: {msg_template_path}")
    logging.info("Starting email automation run.")
    
    # Check if files exist
    if not os.path.exists(excel_file):
        msg = f"Error: Excel file '{excel_file}' not found."
        print(msg)
        logging.error(msg)
        return
    if not os.path.exists(msg_template_path):
        msg = f"Error: Template file '{msg_template_path}' not found."
        print(msg)
        logging.error(msg)
        return

    # Load Excel
    try:
        df = pd.read_excel(excel_file)
        print(f"Loaded {len(df)} rows from {excel_file}")
    except Exception as e:
        msg = f"Error reading Excel file: {e}"
        print(msg)
        logging.error(msg)
        return

    # Initialize Outlook
    try:
        outlook = win32.Dispatch('Outlook.Application')
    except Exception as e:
        msg = f"Error initializing Outlook: {e}"
        print(msg)
        logging.error(msg)
        return

    # Get today's date (normalized to midnight for comparison)
    today = pd.Timestamp.now().normalize()
    print(f"Processing for date: {today.date()}")
    logging.info(f"Processing for date: {today.date()}")

    # Ensure Date column is datetime
    try:
        df[date_column] = pd.to_datetime(df[date_column])
    except Exception as e:
        msg = f"Error converting Date column: {e}"
        print(msg)
        logging.error(msg)
        return

    # Initialize Status column if not exists
    if status_column not in df.columns:
        df[status_column] = ''

    emails_sent = 0

    # Iterate and send
    for index, row in df.iterrows():
        recipient_email = row[email_column]
        scheduled_date = row[date_column]
        current_status = str(row[status_column]) if not pd.isna(row[status_column]) else ""
        
        if pd.isna(recipient_email):
            continue

        # 1. Check if ALREADY SENT
        if "Sent at" in current_status or "Sent on" in current_status:
            msg = f"Skipping {recipient_email} - Already {current_status}"
            print(msg)
            logging.info(msg)
            continue
            
        # 2. Check Date Logic
        if pd.isna(scheduled_date):
            df.at[index, status_column] = 'Not Sent: No Date'
            continue
            
        scheduled_date_norm = scheduled_date.normalize()
        
        if scheduled_date_norm > today:
            # Future Date
            status_msg = f"Not Sent: Will send on {scheduled_date.date()}"
            df.at[index, status_column] = status_msg
            print(f"Skipping {recipient_email} ({status_msg})")
            logging.info(f"Skipping {recipient_email} - Future date")
            continue
            
        elif scheduled_date_norm < today:
            # Past Date (and not sent)
            status_msg = f"Not Sent: Date passed ({scheduled_date.date()})"
            df.at[index, status_column] = status_msg
            print(f"Skipping {recipient_email} ({status_msg})")
            logging.info(f"Skipping {recipient_email} - Date passed")
            continue
            
        # 3. Send Email (Date is Today)
        try:
            # Load the template for each email to ensure a fresh copy
            mail = outlook.CreateItemFromTemplate(msg_template_path)
            
            # Set recipient
            mail.To = recipient_email
            
            # Send
            mail.Send()
            
            # Update status with TIMESTAMP
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            status_msg = f'Sent at {timestamp}'
            df.at[index, status_column] = status_msg
            
            msg = f"Sent email to: {recipient_email} ({status_msg})"
            print(msg)
            logging.info(msg)
            
            emails_sent += 1
            
            # Rate limiting
            time.sleep(2) 
            
        except Exception as e:
            msg = f"Failed to send to {recipient_email}: {e}"
            print(msg)
            logging.error(msg)
            df.at[index, status_column] = f'Failed: {e}'

    # Save updated Excel file
    try:
        df.to_excel(excel_file, index=False)
        print(f"Updated Excel file with status. Total emails sent: {emails_sent}")
        logging.info(f"Run completed. Total emails sent: {emails_sent}")
    except PermissionError:
        msg = f"Error: Could not save '{excel_file}'. Please close the file if it is open."
        print(msg)
        logging.error(msg)
    except Exception as e:
        msg = f"Error saving Excel file: {e}"
        print(msg)
        logging.error(msg)

if __name__ == "__main__":
    send_emails()
