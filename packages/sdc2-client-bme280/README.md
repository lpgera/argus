# sdc2-client-bme280

Client application for BME280 humidity, temperature and barometric pressure sensor.

## Environment variables

Create a file named `.env.bme280` in the root of the repository based on this template:

```dotenv
SDC2_URL=http://server:4000
SDC2_API_KEY=API_KEY_WITH_WRITE_ACCESS
SDC2_LOCATION=MEASUREMENT_LOCATION_NAME

BME280_I2C_BUS_NUMBER= # optional, defaults to 1
BME280_I2C_ADDRESS= # optional, defaults to 0x76
BME280_MEASUREMENT_CRON= # optional, defaults to '*/5 * * * *'
```

If you're using a custom i2c device, you have to add the `BME280_I2C_BUS_NUMBER` override to the main `.env` file too
to make the device mapping working.
