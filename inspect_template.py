import win32com.client as win32
import os
import sys

# Set encoding for windows console
sys.stdout.reconfigure(encoding='utf-8')

template_dir = r'f:\Coding\Email-Automation\Mail Templates'
template_name = 'New Partners.msg'
msg_path = os.path.join(template_dir, template_name)

try:
    outlook = win32.Dispatch('Outlook.Application')
    mail = outlook.CreateItemFromTemplate(msg_path)
    print(f"Subject: {mail.Subject}")
    print("-" * 20)
    
    # Check for "Dear sir" in both Body and HTMLBody
    body = mail.Body
    html_body = mail.HTMLBody
    
    if "Dear sir" in body:
        print("Found 'Dear sir' in Body")
    elif "Dear Sir" in body:
        print("Found 'Dear Sir' in Body")
    else:
        print("'Dear sir' NOT found in Body")
        # Print a snippet to see what's there
        print("Snippet:", body[:200].replace('\r', ' ').replace('\n', ' '))

    if "Dear sir" in html_body:
        print("Found 'Dear sir' in HTMLBody")
    elif "Dear Sir" in html_body:
        print("Found 'Dear Sir' in HTMLBody")
    else:
        print("'Dear sir' NOT found in HTMLBody")

except Exception as e:
    print(f"Error: {e}")
