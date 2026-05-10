# Route Snap

Route Snap is a mobile-first web app that captures an address, normalizes it with AI, and opens the destination in Google Maps.

## Structure

- `frontend/`: Next.js app with Tailwind CSS and simple `ja` / `en` i18n
- `backend/`: FastAPI API that sends the image to the OpenAI Responses API

## Local Setup

Backend:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
$env:OPENAI_API_KEY="sk-proj-..."
$env:OPENAI_MODEL="gpt-5.2"
$env:ALLOWED_ORIGINS="http://localhost:3000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
npm run dev
```

Open `http://localhost:3000`.

## Smartphone Testing

If your PC LAN IP is `192.168.0.10`, use:

```powershell
# backend
$env:ALLOWED_ORIGINS="http://192.168.0.10:3000"

# frontend
$env:NEXT_PUBLIC_API_BASE_URL="http://192.168.0.10:8000"
```

Then open `http://192.168.0.10:3000` on your phone.

## Fly.io Preparation

This repo is prepared as two Fly apps:

- `frontend/fly.toml`
- `backend/fly.toml`

Change the `app` names in both files before first deploy.

Backend:

```powershell
cd backend
fly launch --no-deploy
fly secrets set OPENAI_API_KEY="sk-proj-..."
fly deploy
```

Frontend:

```powershell
cd frontend
fly launch --no-deploy
fly deploy
```

For production, set these values to match your Fly app names:

- `backend/fly.toml`: `ALLOWED_ORIGINS = "https://your-frontend.fly.dev"`
- `frontend/fly.toml`: `NEXT_PUBLIC_API_BASE_URL = "https://your-backend.fly.dev"`

## Notes

Browsers and Google Maps apps do not reliably allow a web page to press the final "Start navigation" button automatically. Route Snap opens Google Maps with the formatted destination already filled in, which is the practical handoff point.
