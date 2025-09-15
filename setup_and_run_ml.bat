@echo off
echo ===================================================
echo Train Traffic Optimization ML Model Setup and Run
echo ===================================================

REM Check if Python is installed
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Navigate to the ML model directory
cd /d "%~dp0\ml_model"

REM Install required packages
echo Installing required Python packages...
python -m pip install -r requirements.txt

IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install required packages. Please check your internet connection and try again.
    pause
    exit /b 1
)

REM Generate mock data if needed
echo Generating mock data for training...
python generate_mock_data.py

REM Run the server
echo Starting ML server...
python api_server.py

pause