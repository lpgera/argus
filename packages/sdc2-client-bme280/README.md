# sdc2-client-bme280

Client application for BME280 humidity, temperature and barometric pressure sensor.

## docker-compose

```yaml
version: '3.8'
services:
  bme280:
    image: ghcr.io/lpgera/sensor-data-collection
    devices:
      - /dev/i2c-1:/dev/i2c-1
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - BME280_I2C_BUS_NUMBER= # optional, defaults to 1
      - BME280_I2C_ADDRESS= # optional, defaults to 0x76
      - BME280_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npx lerna run start --stream --scope=sdc2-client-bme280
    restart: unless-stopped
```
