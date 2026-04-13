from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import pandas as pd
from automation import send_emails
import logging
import shutil
from datetime import datetime

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXCEL_FILE = 'Test Mail.xlsx'
TEMPLATE_DIR = 'Mail Templates'
LOG_FILE = 'automation.log'

@app.get("/api/stats")
async def get_stats():
    try:
        if not os.path.exists(EXCEL_FILE):
            return {
                "sent": 0,
                "pending": 0,
                "failed": 0,
                "templates_count": len([f for f in os.listdir(TEMPLATE_DIR) if f.endswith('.msg')]) if os.path.exists(TEMPLATE_DIR) else 0
            }
            
        df = pd.read_excel(EXCEL_FILE)
        
        # Ensure Status column exists and is string type
        if 'Status' not in df.columns:
            df['Status'] = ''
        df['Status'] = df['Status'].astype(str).replace('nan', '')
            
        total = len(df)
        sent = len(df[df['Status'].str.contains('Sent at', na=False)])
        failed = len(df[df['Status'].str.contains('Failed', na=False)])
        pending = total - sent - failed
        
        templates = [f for f in os.listdir(TEMPLATE_DIR) if f.endswith('.msg')] if os.path.exists(TEMPLATE_DIR) else []
        
        return {
            "sent": sent,
            "pending": pending,
            "failed": failed,
            "templates_count": len(templates)
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/templates")
async def get_templates():
    if not os.path.exists(TEMPLATE_DIR):
        return []
    return [f for f in os.listdir(TEMPLATE_DIR) if f.endswith('.msg')]

@app.get("/api/recipients")
async def get_recipients():
    try:
        if not os.path.exists(EXCEL_FILE):
            return []
        df = pd.read_excel(EXCEL_FILE)
        
        # Convert all columns to strings to avoid any serialization issues for now
        # and handle NaNs by filling with empty string
        df = df.fillna('')
        
        # Ensure all columns are serializable (convert to string if they are not basic types)
        data = []
        for _, row in df.iterrows():
            record = {}
            for col in df.columns:
                val = row[col]
                if isinstance(val, (pd.Timestamp, datetime)):
                    record[col] = val.strftime('%Y-%m-%d')
                else:
                    record[col] = val
            data.append(record)
        return data
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/logs")
async def get_logs():
    if not os.path.exists(LOG_FILE):
        return []
    try:
        with open(LOG_FILE, 'r') as f:
            lines = f.readlines()
            # Return last 50 logs, reversed for newest first
            return lines[-50:][::-1]
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/run")
async def run_automation(background_tasks: BackgroundTasks):
    if not os.path.exists(EXCEL_FILE):
        raise HTTPException(status_code=400, detail="Excel file not found. Please upload one first.")
    background_tasks.add_task(send_emails)
    return {"status": "started", "message": "Email automation process started in background"}

from pydantic import BaseModel

class UpdateRecipient(BaseModel):
    index: int
    column: str
    value: str

class ResendRequest(BaseModel):
    index: int

@app.post("/api/resend")
async def resend_email(request: ResendRequest, background_tasks: BackgroundTasks):
    try:
        if not os.path.exists(EXCEL_FILE):
            raise HTTPException(status_code=400, detail="Excel file not found")
        
        df = pd.read_excel(EXCEL_FILE)
        
        if request.index < 0 or request.index >= len(df):
            raise HTTPException(status_code=400, detail="Invalid index")
            
        # Reset status to trigger automation logic
        df.at[request.index, 'Status'] = ''
        df.to_excel(EXCEL_FILE, index=False)
        
        # Trigger automation
        background_tasks.add_task(send_emails)
        return {"status": "success", "message": "Resend triggered"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/update-recipient")
async def update_recipient(update: UpdateRecipient):
    try:
        if not os.path.exists(EXCEL_FILE):
            raise HTTPException(status_code=400, detail="Excel file not found")
        
        df = pd.read_excel(EXCEL_FILE)
        
        # Validate index
        if update.index < 0 or update.index >= len(df):
            raise HTTPException(status_code=400, detail=f"Invalid index {update.index}")
            
        # Ensure the column exists
        if update.column not in df.columns:
            df[update.column] = ""

        # FORCE column to object/string type before update to avoid dtype float64 errors
        df[update.column] = df[update.column].astype(object)
        
        # Update value
        df.at[update.index, update.column] = update.value
        
        # Save back to Excel
        df.to_excel(EXCEL_FILE, index=False)
        print(f"Successfully updated row {update.index} column {update.column} to {update.value}")
        return {"status": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an Excel file.")
    
    try:
        # Save the file temporarily
        with open(EXCEL_FILE, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return {"status": "success", "filename": EXCEL_FILE}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
