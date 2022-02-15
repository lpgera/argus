# sdc2-client-mijia

Client application for Xiaomi Mijia BLE temperature and humidity sensors. It can read measurements from multiple devices.

## docker-compose

```yaml
version: '3.8'
services:
  mijia:
    image: ghcr.io/lpgera/sensor-data-collection:latest
    network_mode: host
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - MIJIA_LOCATIONS=mac_address_1,location_name_1,mac_address_2,location_name_2
      - MIJIA_MEASUREMENT_CRON= # optional, defaults to '*/5 * * * *'
    command: npx lerna run start --stream --scope=sdc2-client-mijia
    restart: unless-stopped
```
