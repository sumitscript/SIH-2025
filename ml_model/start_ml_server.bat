@echo off
echo Starting Train Traffic Optimization ML Server...

REM Check if Python is installed
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Detected Python version: %PYTHON_VERSION%

REM Navigate to the ML model directory
cd /d "%~dp0"

REM Run the server script
echo Running ML server...
python run_server.py

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to start ML server. Check the error messages above.
    pause
    exit /b 1
)

pause