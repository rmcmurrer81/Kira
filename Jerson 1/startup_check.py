import os

# Required folders
required_folders = ["memory", "logs"]

for folder in required_folders:
    if not os.path.exists(folder):
        os.makedirs(folder)

print("✅ Startup check complete. All folders are ready.")
