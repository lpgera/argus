# sdc2-client-weather

Client application for reading weather data from [OpenWeather](https://openweathermap.org/) and air quality data from
[IQAir](https://www.iqair.com/).

## docker-compose

```yaml
version: '3.8'
services:
  weather:
    image: ghcr.io/lpgera/sensor-data-collection:latest
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - WEATHER_OPENWEATHERMAP_API_KEY=
      - WEATHER_OPENWEATHERMAP_LATITUDE=
      - WEATHER_OPENWEATHERMAP_LONGITUDE=
      - WEATHER_OPENWEATHERMAP_UNITS=
      - WEATHER_AIRVISUAL_API_KEY=
      - WEATHER_AIRVISUAL_COUNTRY=
      - WEATHER_AIRVISUAL_STATE=
      - WEATHER_AIRVISUAL_CITY=
      - WEATHER_MEASUREMENT_CRON= # optional, defaults to */10 * * * *
    command: npx lerna run start --stream --scope=sdc2-client-weather
    restart: unless-stopped
```
