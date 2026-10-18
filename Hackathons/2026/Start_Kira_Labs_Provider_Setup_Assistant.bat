@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 provider_setup_assistant.py
) else (
  python provider_setup_assistant.py
)
if errorlevel 1 pause
