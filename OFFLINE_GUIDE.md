# Offline Run Guide

This project is designed to be fully functional without an internet connection.

## Prerequisites

Before going offline, ensure you have the following installed:
1.  **Python 3.8+** (Configuration tested with 3.14)
2.  **Node.js 16+**

## First Time Setup (Internet Required)

You must run these commands **once** while connected to the internet to download necessary libraries.

1.  **Backend Setup**:
    ```bash
    cd backend
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    ```
    *(If you don't have a requirements.txt, ensure `flask`, `flask-cors`, `pandas`, `numpy` are installed)*

2.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```

## Running the Project (Offline)

Once setup is complete, you can run the project anywhere, anytime.

### Option 1: One-Click Script (Recommended)
Double-click the **`run_project.bat`** file in the main folder.
This will automatically open two windows:
- One for the Flask Backend
- One for the Vite Frontend

### Option 2: Manual Start
If you prefer command line:

1.  **Terminal 1 (Backend)**:
    ```bash
    cd backend
    .\venv\Scripts\activate
    python app.py
    ```

2.  **Terminal 2 (Frontend)**:
    ```bash
    cd frontend
    npm run dev
    ```

## Troubleshooting
- **Browser Error**: "Connection refused" -> Ensure the Backend terminal is running and shows "Running on http://127.0.0.1:5000".
- **Data missing**: If dashboard is empty, ensure `backend/sales_transactions.csv` exists. The backend will generate it automatically if missing.
