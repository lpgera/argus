# mijia

Client application for Xiaomi Mijia BLE temperature and humidity sensors. It can read measurements from multiple devices.

## docker-compose

```yaml
version: '3.8'
services:
  mijia:
    image: ghcr.io/lpgera/argus
    network_mode: host
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - MIJIA_LOCATIONS=mac_address_1,location_name_1,mac_address_2,location_name_2
      - MIJIA_MEASUREMENT_CRON= # optional, defaults to */5 * * * *
    command: npm run start -w mijia
    restart: unless-stopped
```
