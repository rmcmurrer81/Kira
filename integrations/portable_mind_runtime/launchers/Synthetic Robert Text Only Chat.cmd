@echo off
setlocal
set "PYTHONDONTWRITEBYTECODE=1"
set "PYTHONWARNINGS=error"
if defined LOCALAPPDATA (set "KIRA_PUBLIC_DATA=%LOCALAPPDATA%\KiraPortableMind\public_runtime") else (set "KIRA_PUBLIC_DATA=%TEMP%\KiraPortableMind\public_runtime")
pushd "%~dp0.."
py -B -m portable_mind --config config.example.json --data-dir "%KIRA_PUBLIC_DATA%" --profile synthetic_robert
set "EXIT_CODE=%ERRORLEVEL%"
popd
exit /b %EXIT_CODE%
