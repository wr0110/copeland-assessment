# Setup & running

## Prerequisites

- Node 20+, npm
- Docker + Docker Compose (for the deployed/VPN-gated version)
- An OpenWeatherMap API key: https://openweathermap.org/api

## 1. Local development (no Docker)

```bash
cp .env.example .env
# edit .env, set OPENWEATHER_API_KEY

make install

# terminal 1
make dev-api      # NestJS on :3000

# terminal 2
make dev-web      # Vite dev server on :5173, proxies /weather to :3000
```

Open http://localhost:5173.

## 2. Running tests

```bash
make test
```

Runs backend unit tests, backend e2e tests, and frontend component tests.

## 3. Running the whole thing in Docker, gated behind a VPN

This is the setup described in [../README.md](../README.md) and [VPN.md](VPN.md): the app runs in a container with no port published to the host at all, and the only way to reach it is through a WireGuard tunnel into the same private Docker network.

```bash
cp .env.example .env
# edit .env: set OPENWEATHER_API_KEY, and set VPN_SERVER_URL to the
# address VPN clients will actually connect to (see VPN.md)

make up
```

Then follow [VPN.md](VPN.md) to connect and reach the app.

To stop everything:

```bash
make down
```
