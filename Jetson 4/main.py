from consent_checker import has_consent
from bond_memory import log_bond_event

print("Jetson 4: Bonding system online.")

user_id = "default_user"

if has_consent(user_id):
    print(f"User '{user_id}' is trusted.")
    log_bond_event("trust_check", f"{user_id} passed consent check.")
else:
    print(f"User '{user_id}' is not trusted.")
    log_bond_event("trust_check", f"{user_id} failed consent check.")
