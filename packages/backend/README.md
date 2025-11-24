# backend

The backend server application.

## docker-compose

```yaml
services:
  mariadb:
    image: mariadb:10.5
    volumes:
      - ./mysql-data:/var/lib/mysql
    command: >-
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
    environment:
      - MYSQL_DATABASE=argus
      - MYSQL_ROOT_PASSWORD=your_strong_password
    restart: unless-stopped
  backend:
    image: ghcr.io/lpgera/argus
    ports:
      - 4000:4000
    environment:
      - DATABASE_URL=mysql://root:your_strong_password@mariadb/argus
      - USERS=username_1:password_1,username_2:password_2
      - TOKEN_SECRET=RANDOM_JWT_TOKEN_SECRET
      - PORT= # optional, defaults to 4000
      - SESSION_TIMEOUT= # optional, defaults to 7 days
      - DAILY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 30
      - HOURLY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 7
    depends_on:
      - mariadb
    restart: unless-stopped
  # optional cron service, handles alerting rules and missing sensor monitoring notifications with ntfy.sh
  cron:
    image: ghcr.io/lpgera/argus
    environment:
      - DATABASE_URL=mysql://root:your_strong_password@mariadb/argus
      - MONITORING_NTFY_URL = # optional
      - MONITORING_CRON= # optional, defaults to 0 */4 * * *
      - ALERTING_CRON= # optional, defaults to 30 */5 * * * *
    depends_on:
      - mariadb
    command: node src/cron.js
    restart: unless-stopped
```
