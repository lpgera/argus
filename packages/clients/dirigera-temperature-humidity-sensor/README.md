# Dirigera temperature/humidity sensor

Client application for reading temperature and humidity sensor state from Dirigera.

## docker-compose

```yaml
services:
  dirigera-temperature-humidity-sensor:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_TEMPERATURE_HUMIDITY_SENSOR_ID=
      - DIRIGERA_TEMPERATURE_HUMIDITY_SENSOR_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/dirigera-temperature-humidity-sensor
    command: node dirigera-temperature-humidity-sensor.js
    restart: unless-stopped
```
