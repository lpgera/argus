# sdc2-client-hcsr501

Client application for HC-SR501 PIR motion sensor.

## docker-compose

```yaml
version: '3.8'
services:
  hcsr501:
    image: ghcr.io/lpgera/sensor-data-collection:latest
    volumes:
      - /sys:/sys
    environment:
      - SDC2_URL=http://server:4000
      - SDC2_API_KEY=<api key with write access>
      - SDC2_LOCATION=<measurement location name>
      - HCSR501_GPIO_PIN= # optional, defaults to 18
    command: npx lerna run start --stream --scope=sdc2-client-hcsr501
    restart: unless-stopped
```
