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

### "Use my location" and secure origins

The app is served over plain HTTP (TLS isn't set up - traffic never leaves
the VPN tunnel, so it wasn't judged worth the extra moving parts). Browsers
only allow `navigator.geolocation` on secure origins (HTTPS, or
`localhost`), so clicking **Use my current location** will fail with
`Only secure origins are allowed` even though the rest of the app works
fine over `http://172.28.0.10:3000`.

City name, ZIP code, and manually-entered coordinates are unaffected -
this only blocks the browser's own GPS lookup.

To test that one feature locally, tell Chrome to trust this specific origin:

1. Go to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add `http://172.28.0.10:3000`
3. Relaunch Chrome

This is a local testing workaround, not something to rely on for real
deployments - a production setup would terminate TLS (even with a
self-signed cert, since this only needs to satisfy the browser, not a
public CA) in front of the app instead.

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

## Troubleshooting: DNS breaks while connected

`PEERDNS=auto` points connected clients at the CoreDNS sidecar bundled with
the `wireguard` container (`10.13.13.1`), so peers can resolve names on the
internal network. On macOS, `wg-quick` applies that as your system-wide
DNS resolver while the tunnel is up - not just for the VPN's own subnet.

That CoreDNS instance is configured (`vpn/server/coredns/Corefile`) to
forward whatever it doesn't know how to answer to `/etc/resolv.conf`
*inside the `wireguard` container*, which is Docker's embedded resolver
(`127.0.0.11`) - it only knows about containers on this app's own Docker
network, not the public internet. Combined with the system-wide override
above, that turns into a resolution loop: your machine asks `10.13.13.1`,
which asks Docker's internal-only resolver, which has no real upstream to
ask - so ordinary internet lookups (`google.com`, `api.openweathermap.org`,
etc.) fail everywhere on your machine for as long as the tunnel is up, not
just for the app.

The Corefile here has already been fixed to forward to real public
resolvers instead:

```
forward . 1.1.1.1 8.8.8.8
```

If you ever see this again (e.g. after editing the Corefile back or using
a different DNS setup), the fix is the same: point CoreDNS's `forward` at
a real upstream instead of the container's own `/etc/resolv.conf`, then
`docker compose restart wireguard`.

**Don't rely on `wg-quick down` alone to restore DNS.** In principle it
should reverse the `networksetup -setdnsservers` change it made on the way
up, but in practice on macOS it doesn't reliably do so - in testing,
`sudo wg-quick down ./vpn/client/peer1.conf` completed cleanly and the
interface was gone, yet `Ethernet` was still configured to use
`10.13.13.1`. Treat the manual fix below as the real fix, not just a
fallback for when the tunnel died uncleanly:

```bash
networksetup -setdnsservers Ethernet 1.1.1.1 8.8.8.8
networksetup -setsearchdomains Ethernet Empty
networksetup -setdnsservers Tailscale Empty
```

(swap in your Mac's actual DHCP-assigned resolvers instead of `1.1.1.1`/
`8.8.8.8` if you'd rather restore the exact previous values - check
`networksetup -listallnetworkservices` for the full list of services on
your machine, and repeat the `-setdnsservers`/`-setsearchdomains` pair for
any of them that WireGuard touched).

After bringing the tunnel down, check `networksetup -getdnsservers
Ethernet` before assuming DNS is back to normal - don't just trust that
`wg-quick down` handled it.
