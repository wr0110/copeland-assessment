# weather-vpn-app

Look up current weather by city name, ZIP code, or GPS coordinates. Backed
by [OpenWeatherMap](https://openweathermap.org/api). Deployed inside a
private Docker network that's only reachable over WireGuard.

## Stack

- **Backend:** NestJS / TypeScript (`apps/api`)
- **Frontend:** React / Vite / TypeScript (`apps/web`)
- **Deployment:** single Docker image (NestJS serves the built React app
  and the API from one process/port), behind a WireGuard gateway
- Backend and frontend each have their own test suite (Jest for the API,
  Vitest + Testing Library for the UI)

## Quick start

```bash
cp .env.example .env        # set OPENWEATHER_API_KEY
make install
make dev-api                # terminal 1
make dev-web                # terminal 2
```

Full instructions (including running the whole thing in Docker behind
the VPN gateway): [docs/SETUP.md](docs/SETUP.md).

## Docs

- [docs/SETUP.md](docs/SETUP.md) - install, run, test
- [docs/VPN.md](docs/VPN.md) - how the private network is set up, how to
  connect, and how to confirm the app is unreachable without the VPN
- [docs/API.md](docs/API.md) - endpoint reference and examples

## Repo layout

```
apps/
  api/     NestJS backend (weather lookups, serves the built frontend)
  web/     React frontend
vpn/
  server/  wireguard server config (generated at runtime, gitignored)
  client/  exported client configs (generated at runtime, gitignored)
docker-compose.yml   app + wireguard gateway, app has no published port
Dockerfile           multi-stage build: web -> api -> single runtime image
Makefile             install / build / test / lint / up / down / vpn-client-config
```

## AI usage

Used an AI coding assistant for part of this:

- **Docs** - first draft of `docs/API.md` and `docs/VPN.md` (endpoint
  reference, connection steps), then edited for accuracy against the
  actual controller/DTOs and the running compose setup.
- **Frontend** - scaffolded `SearchForm`/`WeatherCard` and the
  `fetchWeather` client in `apps/web`, given the response shape from
  `WeatherResponseDto` as a starting point.

Backend logic (lookup/validation in `WeatherService`, the OpenWeatherMap
client, VPN/network config) was written by hand. Prompts were mostly
"write a form/client for this DTO shape" and "document this endpoint
given this controller" - output was reviewed and adjusted, not used
as-is.
