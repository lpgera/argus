# hcsr501

Client application for HC-SR501 PIR motion sensor.

## docker-compose

```yaml
version: '3.8'
services:
  hcsr501:
    image: ghcr.io/lpgera/argus
    volumes:
      - /sys:/sys
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - HCSR501_GPIO_PIN= # optional, defaults to 18
    command: npm run start -w hcsr501
    restart: unless-stopped
```
