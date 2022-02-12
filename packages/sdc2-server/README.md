# sdc2-server

The server application.

## Environment variables

Create a file named `.env` in the root of the repository based on this template:

```dotenv
DATABASE_URL=mysql://root@mariadb/sensor_data_collection
USERS=username_1:password_1,username_2:password_2
TOKEN_SECRET=RANDOM_JWT_TOKEN_SECRET
PUSHBULLET_API_KEY=YOUR_PUSHBULLET_API_KEY
PORT=4000
SESSION_TIMEOUT= # optional, defaults to '7 days'
DAILY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 30
HOURLY_QUERY_THRESHOLD_IN_DAYS= # optional, defaults to 7
```
