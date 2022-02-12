# sdc2-client-weather

Client application for reading weather data from [OpenWeather](https://openweathermap.org/) and air quality data from
[IQAir](https://www.iqair.com/).

## Environment variables

Create a file named `.env` (development) or `.env.weather` (production with docker-compose) based on this template:

```dotenv
SDC2_URL=http://server:4000
SDC2_API_KEY=API_KEY_WITH_WRITE_ACCESS
SDC2_LOCATION=MEASUREMENT_LOCATION_NAME

WEATHER_OPENWEATHERMAP_API_KEY=
WEATHER_OPENWEATHERMAP_LATITUDE=
WEATHER_OPENWEATHERMAP_LONGITUDE=
WEATHER_OPENWEATHERMAP_UNITS=
WEATHER_AIRVISUAL_API_KEY=
WEATHER_AIRVISUAL_COUNTRY=
WEATHER_AIRVISUAL_STATE=
WEATHER_AIRVISUAL_CITY=
WEATHER_MEASUREMENT_CRON= # optional, defaults to '*/10 * * * *'
```
