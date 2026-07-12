# HabiTracker dashboard (Vue SPA) — standalone image for Railway / Docker
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

# Public FastAPI base URL (no trailing slash). Empty = same-origin /api (local compose proxy).
# Railway: set build arg VITE_API_BASE_URL=https://your-api.up.railway.app
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine

# Official nginx image runs envsubst on /etc/nginx/templates/*.template → conf.d/
# Railway sets PORT; default 80 for local `docker run`.
ENV PORT=80
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
