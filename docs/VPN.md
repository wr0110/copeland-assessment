# Private network / VPN access

The app container is never exposed to the host. It only has an address on
a private Docker network (`172.28.0.0/24`), and the only thing bridging
that network to the outside world is a WireGuard container. Connect over
WireGuard and you land on that same private network; don't, and there's
no route to the app at all.

## 1. Start the stack

```bash
cp .env.example .env
# set OPENWEATHER_API_KEY, and VPN_SERVER_URL to the address this
# machine is reachable at from wherever your VPN client will be
# (its public IP, or a hostname pointing at it - "auto" only works
#  when client and server are on the same machine/network)
make up
```

The `wireguard` container generates a keypair and one peer config on
first boot, under `vpn/server/` (gitignored - these are secrets,
generated fresh per deployment, not something to commit).

## 2. Get the client config

```bash
make vpn-client-config > vpn/client/peer1.conf
```

Hand `peer1.conf` to whoever needs access - it imports straight into any
WireGuard client. For more than one peer, set `PEERS=2` (etc.) in
`docker-compose.yml` before first boot and pull `peer2.conf` the same way.

## 3. Connect

- **Desktop (Mac/Windows/Linux):** install the official WireGuard app
  (https://www.wireguard.com/install/), add a tunnel, and import
  `peer1.conf`. Activate it.
- **CLI (Linux/macOS with wireguard-tools):**
  ```bash
  sudo wg-quick up ./vpn/client/peer1.conf
  ```
- **Mobile:** open the WireGuard app, scan a QR code generated from the
  same file (`qrencode -t ansiutf8 < peer1.conf`), or import it directly.

Once connected, your device gets `10.13.13.2` and can route to
`172.28.0.0/24` (that's what `AllowedIPs` in the peer config grants).

## 4. Use the app

```
http://172.28.0.10:3000
```

Open that in a browser (VPN active) to use the UI, or hit the API directly:

```bash
curl "http://172.28.0.10:3000/weather?city=Kyiv"
```

## 5. Confirm it's *not* reachable without the VPN

Disconnect the WireGuard tunnel, then try the same request:

```bash
curl -m 3 "http://172.28.0.10:3000/weather?city=Kyiv"
# curl: (7) Failed to connect ... / (28) Connection timed out
# or, depending on your OS/router: no route to host
```

`172.28.0.0/24` is a private Docker-internal subnet, so outside the VPN
there's just no route to it. The app's container also publishes no port
to the host, so the only way in is through `wireguard`.

## Notes on the config

- `INTERNAL_SUBNET=10.13.13.0` - the VPN's own point-to-point subnet
- `ALLOWEDIPS=10.13.13.1/32,172.28.0.0/24` - split tunnel, only the
  wireguard server and the app's docker network go through the tunnel
- `PEERDNS=auto` - lets peers resolve names on the internal network
