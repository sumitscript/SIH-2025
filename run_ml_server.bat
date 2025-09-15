@echo off
echo ========================================
echo Starting ML Model Server for SIH 2025
echo ========================================

REM Check if Python is installed
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

REM Check if ml_model directory exists
IF NOT EXIST "ml_model" (
    echo ERROR: ml_model directory not found
    echo Please ensure you are running this from the project root directory
    pause
    exit /b 1
)

REM Navigate to ML model directory
cd ml_model

REM Install required packages
echo Installing required Python packages...
python -m pip install -r requirements.txt

IF %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install required packages
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

REM Generate mock data if needed
echo Generating mock training data...
python generate_mock_data.py

REM Start the ML API server
echo Starting ML API server on http://localhost:5000
echo Press Ctrl+C to stop the server
python api_server.py

pause