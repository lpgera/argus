# sdc2-client-senseair

Client application for SenseAir S8 LP, a low-power CO2 sensor module.

## docker-compose

```yaml
version: '3.8'
services:
  senseair:
    image: ghcr.io/lpgera/sensor-data-collection
    devices:
      - /dev/serial0:/dev/serial0
    environment:
      - SDC2_URL=http://localhost:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - SERIAL_DEVICE_PATH= # optional, defaults to /dev/serial0
      - SENSEAIR_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npm run start -w sdc2-client-senseair
    restart: unless-stopped
```
