# weather

Client application for reading weather data from [OpenWeather](https://openweathermap.org/) and air quality data from
[IQAir](https://www.iqair.com/).

## docker-compose

```yaml
services:
  weather:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - WEATHER_LATITUDE=
      - WEATHER_LONGITUDE=
      - WEATHER_OPENWEATHERMAP_API_KEY=
      - WEATHER_OPENWEATHERMAP_UNITS=
      - WEATHER_AIRVISUAL_API_KEY=
      - WEATHER_MEASUREMENT_CRON= # optional, defaults to */10 * * * *
    command: npm run start -w weather
    restart: unless-stopped
```
