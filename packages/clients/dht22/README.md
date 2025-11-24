# dht22

Client application for DHT22 humidity and temperature sensor.

## docker-compose

```yaml
services:
  dht22:
    image: ghcr.io/lpgera/argus
    privileged: true
    devices:
      - /dev/mem:/dev/mem
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DHT22_GPIO_PIN= # optional, defaults to 4
      - DHT22_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    working_dir: /usr/src/app/packages/clients/dht22
    command: node dht22.js
    restart: unless-stopped
```
