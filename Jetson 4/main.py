from consent_checker import check_trust
from cosplay_trigger import activate_cosplay_mode
from bond_memory import log_bond_event
import time

print("💖 Jetson 4 online — checking trust...")

if check_trust():
    print("✅ Bond level sufficient. Cosplay Mode unlocked.")
    activate_cosplay_mode()
else:
    print("🔒 Bond too low. Kira is staying emotionally private for now.")
    log_bond_event("access_denied_due_to_low_trust")

# Optional: Add more behavior here later
time.sleep(2)
