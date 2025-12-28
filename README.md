# Argus

Argus is a sensor data monitoring and alerting solution built with MariaDB, Node.js and React. Developed and tested on a
Raspberry Pi. Available as a pre-built Docker image from GitHub Package Registry.

## Screenshots

![Screenshot of login page](./screenshots/login.png)

![Screenshot of application dashboard](./screenshots/dashboard.png)

![Screenshot of a measurement chart](./screenshots/chart.png)

## Modules

### Server application

- [Frontend](./packages/frontend)
- [Backend](./packages/backend)

### Measurement clients

- [BME280](./packages/clients/bme280)
- [DHT22](./packages/clients/dht22)
- [Dirigera light sensor](./packages/clients/dirigera-light-sensor)
- [Dirigera temperature/humidity sensor](./packages/clients/dirigera-temperature-humidity-sensor)
- [HC-SR501](./packages/clients/hcsr501)
- [Mijia](./packages/clients/mijia)
- [Parasoll](./packages/clients/parasoll)
- [Senseair](./packages/clients/senseair)
- [Vallhorn](./packages/clients/vallhorn)
- [Vindstyrka](./packages/clients/vindstyrka)
- [Weather](./packages/clients/weather)

## Usage with docker-compose

Consult the documentation of the backend server and the modules you want to use, and create a `docker-compose.yml` file
containing the desired services.

Run the selected services with: `docker-compose up -d`.

## How to setup the development environment

1. This project requires Node.js and Docker to be installed.
2. Create a `.env` file in the root of the repository with the following entries:
   ```dotenv
   DATABASE_URL=mysql://root@mariadb/argus
   TOKEN_SECRET=<generate_and_put_your_own_long_random_string_here>
   USERS=username:password
   ```
3. Initialize the Docker environment: `npm run docker:bootstrap`
4. Seed the database: `npm run docker:seed`
5. Start the dev servers: `npm run docker:up`

That's it! Now you can visit http://localhost:3000 and login with `username` and `password`.
