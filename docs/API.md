# API reference

One endpoint, three ways to call it.

## `GET /weather`

Query params (send exactly one of the three groups below):

| param     | required            | notes                                   |
|-----------|---------------------|------------------------------------------|
| `city`    | for city lookup     | e.g. `Kyiv`, `New York`                  |
| `zip`     | for zip lookup      | postal code                              |
| `country` | optional, with `zip`| ISO country code, e.g. `us`. Defaults to `us` when omitted |
| `lat`     | for coordinate lookup | decimal degrees                        |
| `lon`     | for coordinate lookup | decimal degrees, required alongside `lat` |

Sending more than one group (e.g. `city` and `lat`/`lon` together), or none at all, returns `400`.

### Examples

```bash
curl "http://<host>:3000/weather?city=Kyiv"
curl "http://<host>:3000/weather?zip=10001&country=us"
curl "http://<host>:3000/weather?lat=50.45&lon=30.52"
```

### Response

```json
{
  "location": "Kyiv",
  "country": "UA",
  "coordinates": { "lat": 50.4333, "lon": 30.5167 },
  "temperature": 17.07,
  "feelsLike": 17.29,
  "humidity": 94,
  "windSpeed": 1.65,
  "condition": "Clouds",
  "description": "broken clouds",
  "icon": "04n"
}
```

### Errors

- `400 Bad Request` - no lookup mode given, or more than one given
- `404 Not Found` - OpenWeatherMap has no match for the given city/zip/coordinates
- `502 Bad Gateway` - couldn't reach OpenWeatherMap
