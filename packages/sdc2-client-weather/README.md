# sdc2-client-weather

Client application for reading weather data from [OpenWeather](https://openweathermap.org/) and air quality data from
[IQAir](https://www.iqair.com/).

## docker-compose

```yaml
version: '3.8'
services:
  weather:
    image: ghcr.io/lpgera/sensor-data-collection
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - WEATHER_LATITUDE=
      - WEATHER_LONGITUDE=
      - WEATHER_OPENWEATHERMAP_API_KEY=
      - WEATHER_OPENWEATHERMAP_UNITS=
      - WEATHER_AIRVISUAL_API_KEY=
      - WEATHER_MEASUREMENT_CRON= # optional, defaults to */10 * * * *
    command: npm run start -w sdc2-client-weather
    restart: unless-stopped
```
