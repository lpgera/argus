# sdc2-client-hcsr501

Client application for HC-SR501 PIR motion sensor.

## Environment variables

Create a file named `.env` (development) or `.env.hcsr501` (production with docker-compose) based on this template:

```dotenv
SDC2_URL=http://server:4000
SDC2_API_KEY=API_KEY_WITH_WRITE_ACCESS
SDC2_LOCATION=MEASUREMENT_LOCATION_NAME

HCSR501_GPIO_PIN= # optional, defaults to 18
```
