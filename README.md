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
$env:OPENAI_MODEL="gpt-5.4"
$env:ALLOWED_ORIGINS="http://localhost:3000"
$env:ROUTE_SNAP_API_TOKEN="replace-with-random-secret"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```powershell
cd frontend
npm install
$env:BACKEND_API_BASE_URL="http://localhost:8000"
$env:ROUTE_SNAP_API_TOKEN="replace-with-same-random-secret"
$env:NEXT_PUBLIC_APP_URL="http://localhost:3000"
npm run dev
```

Open `http://localhost:3000`.

## Smartphone Testing

If your PC LAN IP is `192.168.0.10`, use:

```powershell
# backend
$env:ALLOWED_ORIGINS="http://192.168.0.10:3000"

# frontend
$env:BACKEND_API_BASE_URL="http://192.168.0.10:8000"
$env:ROUTE_SNAP_API_TOKEN="replace-with-same-random-secret"
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
fly secrets set ROUTE_SNAP_API_TOKEN="replace-with-random-secret"
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
- Frontend server env: `BACKEND_API_BASE_URL = "https://your-backend.fly.dev"`
- Frontend server secret: `ROUTE_SNAP_API_TOKEN` must match the backend secret

## Auth, Billing, and Legal Pages

Paid plans use Supabase Auth, Supabase tables, and Stripe Checkout.

Run the SQL in `supabase/route_snap_billing.sql` in your Supabase project, then configure these frontend environment variables:

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
$env:SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
$env:STRIPE_SECRET_KEY="sk_live_or_test_..."
$env:STRIPE_WEBHOOK_SECRET="whsec_..."
$env:STRIPE_PRICE_LIGHT="price_..."
$env:STRIPE_PRICE_STANDARD="price_..."
$env:STRIPE_PRICE_PRO="price_..."
$env:STRIPE_PRICE_BUSINESS="price_..."
$env:NEXT_PUBLIC_APP_URL="https://your-domain.example"
```

For Stripe and Japanese commercial disclosure review, also set the public legal information used by `/legal/tokusho` and `/legal/privacy`:

```powershell
$env:NEXT_PUBLIC_LEGAL_SELLER_NAME="販売事業者名"
$env:NEXT_PUBLIC_LEGAL_REPRESENTATIVE="運営責任者名"
$env:NEXT_PUBLIC_LEGAL_ADDRESS="所在地"
$env:NEXT_PUBLIC_LEGAL_PHONE="電話番号"
$env:NEXT_PUBLIC_LEGAL_EMAIL="support@example.com"
```

Stripe webhook endpoint:

```text
https://your-domain.example/api/stripe/webhook
```

Listen for these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Notes

Browsers and Google Maps apps do not reliably allow a web page to press the final "Start navigation" button automatically. Route Snap opens Google Maps with the formatted destination already filled in, which is the practical handoff point.
