# HabiTrackerBOT-WEB

Vue 3 dashboard for **HabiTrackerBot-PRO** (read-only stats, charts, schedule).

Private product UI — deploy from this repo as a separate Railway service.

## Stack

- Vue 3 + Vite + TypeScript
- Chart.js (`vue-chartjs`)
- nginx static hosting

## Talks to

| Endpoint | Service (PRO) |
|----------|----------------|
| `POST /api/v1/auth/exchange` | FastAPI |
| `GET /api/v1/stats/*` | FastAPI |

Auth: one-time token from Telegram bot → JWT (Redis OTT on PRO).

## Local dev

```bash
cp .env.example .env   # optional; empty VITE_API_BASE_URL uses Vite proxy
npm install
npm run dev            # http://localhost:5173  → proxies /api to :8000
```

Run PRO `api` on port 8000 (`uvicorn src.api.app:app --port 8000`).

```bash
npm run typecheck
npm run build
```

## Docker

```bash
docker build -t habitracker-web \
  --build-arg VITE_API_BASE_URL=https://your-api.example.com \
  .
docker run --rm -p 8080:80 habitracker-web
```

## Railway

1. New service → this GitHub repo (`HabiTrackerBOT-WEB`).
2. Root Directory: `/` (repo root).
3. Dockerfile: `Dockerfile`.
4. **Build variable** (Variables → Build):
   ```text
   VITE_API_BASE_URL=https://<your-PRO-api-domain>
   ```
   No trailing slash.
5. Generate domain → e.g. `https://habi-dash.up.railway.app`.

### PRO services (same Railway project)

| Service | Repo | Start |
|---------|------|--------|
| bot | HabiTrackerBot-PRO | `alembic upgrade head && python src/main.py` |
| api | HabiTrackerBot-PRO | `uvicorn src.api.app:app --host 0.0.0.0 --port $PORT` |
| web | **this repo** | Dockerfile default |

### Env wiring

**bot (PRO):**

```text
DASHBOARD_PUBLIC_URL=https://<web-domain>
API_JWT_SECRET=<same as api>
REDIS_URL=<same as api>
```

**api (PRO):**

```text
DATABASE_URL=...
REDIS_URL=...
API_JWT_SECRET=<same as bot>
API_CORS_ORIGINS=https://<web-domain>
```

**web (this):**

```text
VITE_API_BASE_URL=https://<api-domain>   # build-time
```

Do **not** use Marketplace nginx templates — this image already includes nginx + SPA.

## Repo layout

```
src/           Vue app
Dockerfile     multi-stage build
nginx.conf     SPA fallback
```

Companion monorepo folder (local): `../Telegram` → HabiTrackerBot-PRO (bot + API only).
