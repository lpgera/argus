# bme280

Client application for BME280 humidity, temperature and barometric pressure sensor.

## docker-compose

```yaml
services:
  bme280:
    image: ghcr.io/lpgera/argus
    devices:
      - /dev/i2c-1:/dev/i2c-1
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - BME280_I2C_BUS_NUMBER= # optional, defaults to 1
      - BME280_I2C_ADDRESS= # optional, defaults to 0x76
      - BME280_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npm run start -w bme280
    restart: unless-stopped
```
