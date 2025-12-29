import win32com.client as win32
import pandas as pd
import os
import time
from datetime import datetime
import logging

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Setup logging
logging.basicConfig(
    filename='automation.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def send_emails():
    # Updated configuration
    excel_file = 'Test Mail.xlsx'
    template_dir = 'Mail Templates'
    email_column = 'Mail ID'
    template_column = 'Templates'
    date_column = 'Date'
    status_column = 'Status'

    # Validate template directory
    if not os.path.exists(template_dir):
        msg = f"Error: Template directory '{template_dir}' not found"
        print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
        logging.error(msg)
        return

    # Load Excel with sheet specification
    try:
        df = pd.read_excel(excel_file, sheet_name=0)
        if template_column not in df.columns:
            msg = f"Column '{template_column}' missing in Excel"
            print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
            logging.error(msg)
            return
    except Exception as e:
        msg = f"Error reading Excel file: {e}"
        print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
        logging.error(msg)
        return

    # Initialize Outlook
    try:
        outlook = win32.Dispatch('Outlook.Application')
    except Exception as e:
        msg = f"Error initializing Outlook: {e}"
        print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
        logging.error(msg)
        return

    # Get today's date (normalized to midnight for comparison)
    today = pd.Timestamp.now().normalize()
    print(f"\n{Colors.CYAN}{Colors.BOLD}📧 Email Automation Started{Colors.ENDC}")
    print(f"{Colors.BLUE}📅 Processing for date: {today.date()}{Colors.ENDC}\n")
    logging.info(f"Processing for date: {today.date()}")

    # Ensure Date column is datetime
    try:
        df[date_column] = pd.to_datetime(df[date_column])
    except Exception as e:
        msg = f"Error converting Date column: {e}"
        print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
        logging.error(msg)
        return

    # Initialize Status column if not exists
    if status_column not in df.columns:
        df[status_column] = ''
    else:
        # Convert to string to avoid dtype warnings
        df[status_column] = df[status_column].astype(str)

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
            print(f"{Colors.YELLOW}⏭️  {msg}{Colors.ENDC}")
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
            print(f"{Colors.YELLOW}⏰ Skipping {recipient_email} ({status_msg}){Colors.ENDC}")
            logging.info(f"Skipping {recipient_email} - Future date")
            continue
            
        elif scheduled_date_norm < today:
            # Past Date (and not sent)
            status_msg = f"Not Sent: Date passed ({scheduled_date.date()})"
            df.at[index, status_column] = status_msg
            print(f"{Colors.YELLOW}⏳ Skipping {recipient_email} ({status_msg}){Colors.ENDC}")
            logging.info(f"Skipping {recipient_email} - Date passed")
            continue
            
        # 3. Send Email (Date is Today)
        try:
            template_name = row[template_column]
            if pd.isna(template_name):
                df.at[index, status_column] = 'Missing Template Name'
                continue

            # Handle template name with or without .msg extension
            if not template_name.lower().endswith('.msg'):
                template_name = f"{template_name}.msg"
            
            msg_path = os.path.abspath(os.path.join(template_dir, template_name))
            if not os.path.exists(msg_path):
                df.at[index, status_column] = f'Template Not Found: {template_name}'
                continue

            # Load template
            mail = outlook.CreateItemFromTemplate(msg_path)
            mail.To = recipient_email
            mail.Send()

            # Update status
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            status_msg = f'Sent at {timestamp}'
            df.at[index, status_column] = status_msg

            print(f"{Colors.GREEN}{Colors.BOLD}✅ Email sent to {recipient_email}{Colors.ENDC}")
            logging.info(f"Sent email to {recipient_email} using {template_name}")
            emails_sent += 1
            time.sleep(2)

        except Exception as e:
            error_msg = f"Failed sending to {recipient_email}: {str(e)}"
            logging.error(error_msg)
            print(f"{Colors.RED}❌ {error_msg}{Colors.ENDC}")
            df.at[index, status_column] = f'Failed: {e}'

        # Save updated Excel file
        try:
            df.to_excel(excel_file, index=False)
        except PermissionError:
            msg = f"Error: Could not save '{excel_file}'. Please close the file if it is open."
            print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
            logging.error(msg)
        except Exception as e:
            msg = f"Error saving Excel file: {e}"
            print(f"{Colors.RED}{Colors.BOLD}❌ {msg}{Colors.ENDC}")
            logging.error(msg)

    print(f"\n{Colors.GREEN}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.GREEN}{Colors.BOLD}✨ Run Completed Successfully!{Colors.ENDC}")
    print(f"{Colors.GREEN}{Colors.BOLD}📨 Total emails sent: {emails_sent}{Colors.ENDC}")
    print(f"{Colors.GREEN}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")
    logging.info(f"Run completed. Total emails sent: {emails_sent}")

if __name__ == "__main__":
    send_emails()