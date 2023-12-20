# Parasoll

Client application for reading open/close state from a PARASOLL sensor.

## docker-compose

```yaml
version: '3.8'
services:
  parasoll:
    image: ghcr.io/lpgera/argus
    environment:
      - ARGUS_URL=http://backend:4000
      - ARGUS_API_KEY=<api key with write access>
      - ARGUS_SENSOR_LOCATION=<sensor location name>
      - DIRIGERA_GATEWAY_IP=
      - DIRIGERA_ACCESS_TOKEN=
      - DIRIGERA_PARASOLL_ID=
    command: npm run start -w parasoll
    restart: unless-stopped
```
