# Sentinel Mesh

Sentinel Mesh is a real-time security monitoring dashboard that ingests telemetry, correlates related events into incidents, forecasts likely next steps, and streams updates to the frontend.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:socket_app --reload --port 5000
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The frontend connects to the backend at `http://localhost:5000` by default. Set `VITE_API_URL` when using a different backend URL.
