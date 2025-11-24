# senseair

Client application for SenseAir S8 LP, a low-power CO2 sensor module.

## docker-compose

```yaml
services:
  senseair:
    image: ghcr.io/lpgera/argus
    devices:
      - /dev/serial0:/dev/serial0
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - SENSEAIR_SERIAL_DEVICE_PATH= # optional, defaults to /dev/serial0
      - SENSEAIR_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/senseair
    command: node senseair.js
    restart: unless-stopped
```
