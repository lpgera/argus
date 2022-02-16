# sdc2-client-dht22

Client application for DHT22 humidity and temperature sensor.

## docker-compose

```yaml
version: '3.8'
services:
  dht22:
    image: ghcr.io/lpgera/sensor-data-collection:latest
    privileged: true
    devices:
      - /dev/mem:/dev/mem
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - DHT22_GPIO_PIN= # optional, defaults to 4
      - DHT22_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npx lerna run start --stream --scope=sdc2-client-dht22
    restart: unless-stopped
```
