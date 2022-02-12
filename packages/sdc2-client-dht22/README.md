# sdc2-client-dht22

Client application for DHT22 humidity and temperature sensor.

## Environment variables

Create a file named `.env.dht22` in the root of the repository based on this template:

```dotenv
SDC2_URL=http://server:4000
SDC2_API_KEY=API_KEY_WITH_WRITE_ACCESS
SDC2_LOCATION=MEASUREMENT_LOCATION_NAME

DHT22_GPIO_PIN= # optional, defaults to 4
DHT22_MEASUREMENT_CRON= # optional, defaults to '*/5 * * * *'
```
