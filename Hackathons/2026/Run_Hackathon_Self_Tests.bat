@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  set "PYTHON=py -3"
) else (
  where python >nul 2>nul
  if not %errorlevel%==0 (
    echo Python was not found. Install Python 3.10 or newer first.
    pause
    exit /b 1
  )
  set "PYTHON=python"
)

%PYTHON% -m py_compile incubator_core.py local_ledger_store.py project_toolkit.py provider_status.py cloud_preflight.py provider_setup_assistant.py secret_scan.py hackathon_test_center.py call-e-kira-accessline\call_e_live_adapter.py
if errorlevel 1 goto :failed

%PYTHON% -m unittest discover -s tests -v
if errorlevel 1 goto :failed

%PYTHON% project_toolkit.py self-test
if errorlevel 1 goto :failed

%PYTHON% secret_scan.py .
if errorlevel 1 goto :failed

echo.
echo ALL LOCAL HACKATHON TESTS PASSED.
pause
exit /b 0

:failed
echo.
echo A test failed. Copy the complete message and send it to ChatGPT.
pause
exit /b 1
