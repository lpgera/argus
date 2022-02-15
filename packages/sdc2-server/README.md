# sdc2-server

The server application.

## docker-compose

```yaml
version: '3.8'
services:
  mariadb:
    image: mariadb:10.5
    volumes:
      - ./mysql-data:/var/lib/mysql
    command: >-
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
    environment:
      - MYSQL_DATABASE=sensor_data_collection
      - MYSQL_ALLOW_EMPTY_PASSWORD=true
    restart: unless-stopped
  server:
    image: ghcr.io/lpgera/sensor-data-collection:latest
    ports:
      - 4000:4000
    environment:
      - DATABASE_URL=mysql://root@mariadb/sensor_data_collection
      - USERS=username_1:password_1,username_2:password_2
      - TOKEN_SECRET=RANDOM_JWT_TOKEN_SECRET
      - PUSHBULLET_API_KEY=YOUR_PUSHBULLET_API_KEY
      - PORT= # optional, defaults to 4000
      - SESSION_TIMEOUT= # optional, defaults to '7 days'
      - DAILY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 30
      - HOURLY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 7
    depends_on:
      - mariadb
    restart: unless-stopped
```
