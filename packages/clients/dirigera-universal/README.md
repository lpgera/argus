# Dirigera universal

Client application for reading sensor states from a Dirigera hub. Handles multiple locations and multiple sensors.

The `DIRIGERA_SENSORS` environment variable should contain a JSON object in this format:

```json
{
  "LOCATION_NAME": [
    {
      "deviceId": "DEVICE_ID",
      "attributeMapping": {
        "DEVICE_ATTRIBUTE": "MEASUREMENT_TYPE"
      }
    }
  ]
}
```

## docker-compose

```yaml
services:
  dirigera-universal:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_SENSORS=
      - DIRIGERA_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/dirigera-universal
    command: node dirigera-universal.js
    restart: unless-stopped
```
