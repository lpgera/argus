# Dirigera light sensor

Client application for reading light sensor state from Dirigera.

## docker-compose

```yaml
services:
  dirigera-light-sensor:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_LIGHT_SENSOR_ID=
      - DIRIGERA_LIGHT_SENSOR_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/dirigera-light-sensor
    command: node dirigera-light-sensor.js
    restart: unless-stopped
```
