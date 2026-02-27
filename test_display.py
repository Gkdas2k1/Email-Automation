import win32com.client as win32
import pandas as pd
import os
import re
from datetime import datetime

# Configuration
excel_file = 'Test Mail.xlsx'
template_dir = 'Mail Templates'
email_column = 'Mail ID'
template_column = 'Templates'
date_column = 'Date'
name_column = 'Name'

def test_display():
    if not os.path.exists(template_dir):
        print(f"Error: Template directory '{template_dir}' not found")
        return

    try:
        df = pd.read_excel(excel_file)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    try:
        outlook = win32.Dispatch('Outlook.Application')
    except Exception as e:
        print(f"Error initializing Outlook: {e}")
        return

    # Just test the first recipient for demonstration
    row = df.iloc[0]
    recipient_email = row[email_column]
    recipient_name = row[name_column] if name_column in df.columns else "Test Name"
    template_name = row[template_column]

    if not template_name.lower().endswith('.msg'):
        template_name = f"{template_name}.msg"
    
    msg_path = os.path.abspath(os.path.join(template_dir, template_name))
    
    print(f"Testing personalization for: {recipient_name} ({recipient_email})")
    print(f"Using template: {template_name}")

    try:
        mail = outlook.CreateItemFromTemplate(msg_path)
        mail.To = recipient_email
        
        name_to_use = str(recipient_name).strip()
        if name_to_use:
            greeting = f"Hi {name_to_use},"
            placeholders = ["Hi Team,", "Hi Team", "Dear sir,", "Dear sir", "Dear Sir,", "Dear Sir"]
            
            # HTMLBody replacement ONLY to preserve formatting
            found_html = False
            for p in placeholders:
                if p in mail.HTMLBody:
                    mail.HTMLBody = mail.HTMLBody.replace(p, greeting)
                    found_html = True
                    break
            if not found_html:
                if "<body" in mail.HTMLBody.lower():
                    mail.HTMLBody = re.sub(r'(<body[^>]*>)', rf'\1<p>{greeting}</p>', mail.HTMLBody, flags=re.IGNORECASE)
                else:
                    mail.HTMLBody = f"<p>{greeting}</p>{mail.HTMLBody}"

        print("Opening email in Outlook for verification...")
        mail.Display() # THIS OPENS THE EMAIL INSTEAD OF SENDING
        print("Done! Please check your Outlook.")

    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_display()
