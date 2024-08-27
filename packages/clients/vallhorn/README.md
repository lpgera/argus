# Vallhorn

Client application for reading motion sensor state from a VALLHORN sensor.

## docker-compose

```yaml
services:
  vallhorn:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_VALLHORN_ID=
      - VALLHORN_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npm run start -w vallhorn
    restart: unless-stopped
```
