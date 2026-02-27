import win32com.client as win32
import os
import sys
import re

# Set encoding for windows console
sys.stdout.reconfigure(encoding='utf-8')

template_dir = r'f:\Coding\Email-Automation\Mail Templates'
template_name = 'Customer Mail New.msg'
msg_path = os.path.join(template_dir, template_name)

recipient_name = "Adil Cholas"

try:
    outlook = win32.Dispatch('Outlook.Application')
    mail = outlook.CreateItemFromTemplate(msg_path)
    
    print(f"Original Body (Start): {mail.Body[:50]}")
    
    name_to_use = str(recipient_name).strip()
    greeting = f"Hi {name_to_use},"
    placeholders = ["Hi Team,", "Hi Team", "Dear sir,", "Dear sir", "Dear Sir,", "Dear Sir"]
    
    # Test Body replacement
    body = mail.Body
    found_placeholder = False
    for p in placeholders:
        if p in body:
            body = body.replace(p, greeting)
            found_placeholder = True
            break
    if not found_placeholder:
        body = f"{greeting}\n\n{body}"
    
    print(f"Personalized Body (Start): {body[:50]}")
    
    # Test HTMLBody replacement
    html_body = mail.HTMLBody
    found_placeholder_html = False
    for p in placeholders:
        if p in html_body:
            html_body = html_body.replace(p, greeting)
            found_placeholder_html = True
            break
    if not found_placeholder_html:
        if "<body" in html_body.lower():
            html_body = re.sub(r'(<body[^>]*>)', rf'\1<p>{greeting}</p>', html_body, flags=re.IGNORECASE)
        else:
            html_body = f"<p>{greeting}</p>{html_body}"
            
    if greeting in body:
        print("SUCCESS: Greeting found in Body")
    if greeting in html_body:
        print("SUCCESS: Greeting found in HTMLBody")

except Exception as e:
    print(f"Error: {e}")
