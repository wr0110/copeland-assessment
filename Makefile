.PHONY: install build test lint dev-api dev-web up down logs vpn-client-config clean

install:
	cd apps/api && npm ci
	cd apps/web && npm ci

build:
	cd apps/api && npm run build
	cd apps/web && npm run build

test:
	cd apps/api && npm test && npm run test:e2e
	cd apps/web && npm test

lint:
	cd apps/api && npm run lint

# run the backend and frontend locally, without docker, for day to day development
dev-api:
	cd apps/api && npm run start:dev

dev-web:
	cd apps/web && npm run dev

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

# prints the WireGuard client config generated for peer1, once `make up`
# has had a few seconds to start the wireguard container
vpn-client-config:
	@docker compose exec wireguard cat /config/peer1/peer1.conf

clean:
	rm -rf apps/api/dist apps/api/node_modules
	rm -rf apps/web/dist apps/web/node_modules
