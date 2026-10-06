"""Clickable provider setup assistant for Robert on Windows.

The assistant never asks for, stores, reads, or prints secret values. It opens
current provider pages, copies exact environment-variable names, opens the
Windows user-environment editor, and reports configuration presence only.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import webbrowser
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk

import provider_status

ROOT = Path(__file__).resolve().parent
GUIDE = ROOT / "CLICK_BY_CLICK_PROVIDER_SETUP_WINDOWS.md"

PROVIDERS = {
    "Google Gemini": {
        "needed_for": "Kira Project Truthkeeper / All Things Agentic",
        "url": "https://aistudio.google.com/app/apikey",
        "variables": ("GEMINI_API_KEY",),
        "non_secret": (),
        "steps": (
            "Click Create API key in Google AI Studio.",
            "Create or choose the project Kira-Labs-Hackathons-2026.",
            "Copy the key once, then save it as the Windows USER variable GEMINI_API_KEY.",
            "Close and reopen the test center after saving the variable.",
        ),
    },
    "AWS / Strands": {
        "needed_for": "Kira Memory Steward / Agents for Humans",
        "url": "https://console.aws.amazon.com/bedrock/",
        "variables": ("AWS_PROFILE", "AWS_REGION"),
        "non_secret": (("AWS_PROFILE", "kira-hackathons"), ("AWS_REGION", "us-east-1")),
        "steps": (
            "Finish root-user MFA before doing anything else in AWS.",
            "Create a small monthly AWS Budget alert.",
            "Do not create or paste a root access key.",
            "Later configure a non-root AWS CLI profile named kira-hackathons.",
        ),
    },
    "CockroachDB Cloud": {
        "needed_for": "Kira Memory Ledger / CockroachDB x AWS",
        "url": "https://cockroachlabs.cloud/",
        "variables": ("DATABASE_URL",),
        "non_secret": (),
        "steps": (
            "Choose Basic, AWS, and a nearby AWS region such as us-east-1.",
            "Use the lowest capacity limits for development.",
            "After creation, restrict Networking to Current Network.",
            "Copy the General connection string into the Windows USER variable DATABASE_URL.",
        ),
    },
    "CALL-E": {
        "needed_for": "Kira AccessLine / CALL-E Hackathon",
        "url": "https://dashboard.heycall-e.com/account/api-keys",
        "variables": ("CALLE_API_KEY",),
        "non_secret": (),
        "steps": (
            "Create a CALL-E account and verify the email address.",
            "Create an API key named Kira AccessLine Dev.",
            "Save it as the Windows USER variable CALLE_API_KEY.",
            "Do not place a real call until the simulation and one-call plan are reviewed.",
        ),
    },
}


def copy_text(root: tk.Misc, text: str) -> None:
    root.clipboard_clear()
    root.clipboard_append(text)
    root.update_idletasks()


def open_environment_editor() -> None:
    if os.name != "nt":
        raise RuntimeError("The Windows environment-variable editor is available only on Windows.")
    subprocess.Popen(
        ["rundll32.exe", "sysdm.cpl,EditEnvironmentVariables"],
        close_fds=True,
    )


def open_guide() -> None:
    if not GUIDE.exists():
        raise FileNotFoundError(GUIDE)
    if os.name == "nt":
        os.startfile(GUIDE)  # type: ignore[attr-defined]
    else:
        webbrowser.open(GUIDE.as_uri())


def command_status() -> dict[str, object]:
    return {
        "python": sys.version.split()[0],
        "aws_cli_installed": shutil.which("aws") is not None,
        "git_installed": shutil.which("git") is not None,
        "provider_configuration": provider_status.status(),
        "secret_values_read_or_printed": False,
    }


class SetupAssistant(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Kira Labs Provider Setup Assistant")
        self.geometry("1050x760")
        self.minsize(820, 580)

        ttk.Label(
            self,
            text="Kira Labs Provider Setup Assistant",
            font=("Segoe UI", 19, "bold"),
        ).pack(anchor="w", padx=18, pady=(16, 4))
        ttk.Label(
            self,
            text=(
                "This window never asks for or prints a key. Use it to open the right page, "
                "copy the exact variable name, and check whether Windows can see the setup."
            ),
            wraplength=970,
        ).pack(anchor="w", padx=18, pady=(0, 12))

        top = ttk.Frame(self)
        top.pack(fill="x", padx=18, pady=(0, 8))
        ttk.Button(top, text="Open Windows user variables", command=self._open_env).pack(side="left", padx=(0, 6))
        ttk.Button(top, text="Open full click-by-click guide", command=self._open_guide).pack(side="left", padx=6)
        ttk.Button(top, text="Refresh setup status", command=self.refresh_status).pack(side="left", padx=6)

        notebook = ttk.Notebook(self)
        notebook.pack(fill="both", expand=True, padx=18, pady=8)
        for name, data in PROVIDERS.items():
            frame = ttk.Frame(notebook, padding=14)
            notebook.add(frame, text=name)
            self._build_provider_tab(frame, name, data)

        status_frame = ttk.LabelFrame(self, text="Detected setup (values are never shown)", padding=10)
        status_frame.pack(fill="both", expand=False, padx=18, pady=(0, 16))
        self.status_text = tk.Text(status_frame, height=12, wrap="word", font=("Consolas", 10))
        self.status_text.pack(fill="both", expand=True)
        self.refresh_status()

    def _build_provider_tab(self, frame: ttk.Frame, name: str, data: dict[str, object]) -> None:
        ttk.Label(frame, text=name, font=("Segoe UI", 15, "bold")).pack(anchor="w")
        ttk.Label(frame, text=f"Needed for: {data['needed_for']}").pack(anchor="w", pady=(2, 10))
        for step in data["steps"]:  # type: ignore[index]
            ttk.Label(frame, text=f"• {step}", wraplength=920, justify="left").pack(anchor="w", pady=2)

        controls = ttk.Frame(frame)
        controls.pack(fill="x", pady=(16, 8))
        ttk.Button(
            controls,
            text="Open official setup page",
            command=lambda url=str(data["url"]): webbrowser.open(url),
        ).pack(side="left", padx=(0, 8))

        variables = tuple(data["variables"])  # type: ignore[arg-type]
        for variable in variables:
            ttk.Button(
                controls,
                text=f"Copy {variable}",
                command=lambda value=variable: self._copy(value),
            ).pack(side="left", padx=4)

        non_secret = tuple(data["non_secret"])  # type: ignore[arg-type]
        if non_secret:
            examples = ttk.LabelFrame(frame, text="Safe non-secret values", padding=10)
            examples.pack(fill="x", pady=(8, 0))
            for variable, value in non_secret:
                row = ttk.Frame(examples)
                row.pack(fill="x", pady=3)
                ttk.Label(row, text=f"{variable} = {value}", font=("Consolas", 10)).pack(side="left")
                ttk.Button(row, text="Copy value", command=lambda v=value: self._copy(v)).pack(side="right")

    def _copy(self, value: str) -> None:
        copy_text(self, value)
        self.bell()

    def _open_env(self) -> None:
        try:
            open_environment_editor()
        except Exception as exc:
            messagebox.showerror("Could not open Windows settings", str(exc))

    def _open_guide(self) -> None:
        try:
            open_guide()
        except Exception as exc:
            messagebox.showerror("Could not open guide", str(exc))

    def refresh_status(self) -> None:
        value = command_status()
        self.status_text.delete("1.0", "end")
        self.status_text.insert("end", json.dumps(value, indent=2))
        self.status_text.see("1.0")


if __name__ == "__main__":
    SetupAssistant().mainloop()
