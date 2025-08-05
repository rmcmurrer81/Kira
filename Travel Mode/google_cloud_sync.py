
# google_cloud_sync.py
# Automatically syncs Kira's memory and journal to Google Drive using pydrive

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import os
import time

MEMORY_FOLDER = "memory_logs"  # Local folder to sync

def authenticate_drive():
    gauth = GoogleAuth()
    gauth.LocalWebserverAuth()
    return GoogleDrive(gauth)

def upload_files(drive, folder_path):
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            file_drive = drive.CreateFile({'title': filename})
            file_drive.SetContentFile(file_path)
            file_drive.Upload()
            print(f"Uploaded: {filename}")

def run_sync_loop():
    drive = authenticate_drive()
    print("Google Drive Authenticated.")
    while True:
        upload_files(drive, MEMORY_FOLDER)
        print("Sync complete. Waiting 5 minutes...")
        time.sleep(300)  # 5 minutes

if __name__ == "__main__":
    run_sync_loop()
