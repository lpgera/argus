# Parasoll

Client application for reading open/close state from a PARASOLL sensor.

## docker-compose

```yaml
services:
  parasoll:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_PARASOLL_ID=
      - PARASOLL_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/parasoll
    restart: unless-stopped
```
