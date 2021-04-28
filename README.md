# Sensor data collection

Sensor data collection (codenamed SDC2) is a sensor monitoring solution built with MariaDB, NodeJS and React.

## Screenshots

![](./screenshots/login.png)

![](./screenshots/dashboard.png)

![](./screenshots/chart.png)

## How to setup the development environment

1. This project requires NodeJS 10.x and Docker to be installed.
2. Initialize the Docker environment: `npm run bootstrap`
3. Start the dev servers: `npm run up`
4. Seed the database: `npm run seed`
5. View logs: `npm run logs`

That's it! Now you can visit http://localhost:8080 and login with `username` and `password`.

## How to add dependencies

The repository is a monorepo managed with [lerna](https://lerna.js.org/), so dependencies must be added with the
following command:

`npx lerna add <new-package> --scope=<package-to-install-to>`
