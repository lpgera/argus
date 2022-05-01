# Sensor data collection

Sensor data collection (codenamed SDC2) is a sensor monitoring solution built with MariaDB, Node.js and React.
Developed and tested on a Raspberry Pi.

## Screenshots

![Screenshot of login page](./screenshots/login.png)

![Screenshot of application dashboard](./screenshots/dashboard.png)

![Screenshot of a measurement chart](./screenshots/chart.png)

## Modules

### Server application

- [Frontend](./packages/sdc2-frontend)
- [Backend](./packages/sdc2-server)

### Measurement clients

- [BME280](./packages/sdc2-client-bme280)
- [DHT22](./packages/sdc2-client-dht22)
- [HC-SR501](./packages/sdc2-client-hcsr501)
- [Mijia](./packages/sdc2-client-mijia)
- [Weather](./packages/sdc2-client-weather)

## Usage with docker-compose

Consult the documentation of the backend server and the modules you want to use, and create a `docker-compose.yml` file
containing the desired services.

Run the selected services with: `docker-compose up -d`.

## How to setup the development environment

1. This project requires Node.js 18.x and Docker to be installed.
2. Create a `.env` file in the root of the repository with the following entries:
   ```dotenv
   DATABASE_URL=mysql://root@mariadb/sensor_data_collection
   TOKEN_SECRET=<generate_and_put_your_own_long_random_string_here>
   USERS=username:password
   ```
3. Initialize the Docker environment: `npm run bootstrap`
4. Seed the database: `npm run seed`
5. Start the dev servers: `npm run up`

That's it! Now you can visit http://localhost:3000 and login with `username` and `password`.
