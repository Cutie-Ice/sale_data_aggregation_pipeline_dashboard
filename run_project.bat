@echo off
echo Starting Project in Offline Mode...

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b
)

:: Check if Node/NPM is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js/NPM is not installed or not in PATH.
    pause
    exit /b
)

echo Starting Backend...
start "Backend API" cmd /k "cd backend && if exist venv\Scripts\activate (call venv\Scripts\activate && python app.py) else (python app.py)"

echo Starting Frontend...
start "Frontend Dashboard" cmd /k "cd frontend && npm run dev"

echo Starting Data Generator...
start "Data Generator" cmd /k "cd backend && if exist venv\Scripts\activate (call venv\Scripts\activate && python transaction.py) else (python transaction.py)"

echo.
echo Project is running!
echo Backend: http://127.0.0.1:5000
echo Frontend: http://localhost:5173 (usually)
echo.
echo Close the popup windows to stop the servers.
pause
