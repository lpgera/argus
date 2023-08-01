# vindstyrka

Client application for reading PM2.5 and tVOC measurements from a VINDSTYRKA sensor.

## docker-compose

```yaml
version: '3.8'
services:
  vindstyrka:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_VINDSTYRKA_ID=
      - VINDSTYRKA_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npm run start -w vindstyrka
    restart: unless-stopped
```
