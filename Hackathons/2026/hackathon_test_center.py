"""Clickable local test center for Robert.

This window runs only deterministic local demos. It does not use API keys, place
calls, connect to email, or modify Kira World.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
import tkinter as tk
from tkinter import messagebox, ttk

import project_toolkit as toolkit
import provider_status

ROOT = Path(__file__).resolve().parent


class TestCenter(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Kira Labs Hackathon Test Center")
        self.geometry("980x720")
        self.minsize(760, 520)

        header = ttk.Label(
            self,
            text="Kira Labs Hackathon Test Center",
            font=("Segoe UI", 18, "bold"),
        )
        header.pack(padx=16, pady=(16, 4), anchor="w")
        ttk.Label(
            self,
            text=(
                "Synthetic local demos only — no cloud model, phone call, private Kira data, "
                "or real-world action."
            ),
        ).pack(padx=16, pady=(0, 12), anchor="w")

        controls = ttk.Frame(self)
        controls.pack(fill="x", padx=16)
        buttons = (
            ("Run all self-tests", self.run_self_tests),
            ("Memory Steward", lambda: self.run_demo("memory-steward")),
            ("Project Truthkeeper", lambda: self.run_demo("truthkeeper")),
            ("AccessLine simulation", lambda: self.run_demo("accessline")),
            ("Memory Ledger", lambda: self.run_demo("memory-ledger")),
            ("Safe Start Navigator", lambda: self.run_demo("safe-start")),
            ("Check API setup", self.show_provider_status),
            ("Provider setup assistant", self.open_setup_assistant),
        )
        for index, (label, command) in enumerate(buttons):
            ttk.Button(controls, text=label, command=command).grid(
                row=index // 3,
                column=index % 3,
                padx=5,
                pady=5,
                sticky="ew",
            )
        for column in range(3):
            controls.columnconfigure(column, weight=1)

        self.status_var = tk.StringVar(value="Ready")
        ttk.Label(self, textvariable=self.status_var).pack(fill="x", padx=16, pady=(10, 4))

        output_frame = ttk.Frame(self)
        output_frame.pack(fill="both", expand=True, padx=16, pady=(0, 16))
        self.output = tk.Text(output_frame, wrap="word", font=("Consolas", 10))
        scroll = ttk.Scrollbar(output_frame, orient="vertical", command=self.output.yview)
        self.output.configure(yscrollcommand=scroll.set)
        self.output.pack(side="left", fill="both", expand=True)
        scroll.pack(side="right", fill="y")

    def display(self, title: str, value: object) -> None:
        self.output.delete("1.0", "end")
        self.output.insert("end", f"{title}\n{'=' * len(title)}\n\n")
        self.output.insert("end", json.dumps(value, indent=2, ensure_ascii=False))
        self.output.see("1.0")
        self.status_var.set(f"Completed: {title}")

    def run_self_tests(self) -> None:
        try:
            result = toolkit.self_test()
        except Exception as exc:  # GUI boundary: show actionable error to owner.
            self.status_var.set("Self-test failed")
            messagebox.showerror("Self-test failed", str(exc))
            return
        self.display("All local self-tests", result)
        messagebox.showinfo("Tests passed", "All local deterministic project tests passed.")

    def run_demo(self, name: str) -> None:
        try:
            value = toolkit.demo(name)
        except Exception as exc:
            self.status_var.set(f"Demo failed: {name}")
            messagebox.showerror("Demo failed", str(exc))
            return
        self.display(name, value)


    def open_setup_assistant(self) -> None:
        try:
            subprocess.Popen([sys.executable, str(ROOT / "provider_setup_assistant.py")])
        except Exception as exc:
            messagebox.showerror("Could not open setup assistant", str(exc))

    def show_provider_status(self) -> None:
        self.display("Optional API/provider setup", provider_status.status())


if __name__ == "__main__":
    TestCenter().mainloop()
