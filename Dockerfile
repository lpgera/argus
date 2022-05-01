FROM --platform=$BUILDPLATFORM node:18 as FRONTEND

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/sdc2-frontend/package.json packages/sdc2-frontend/

RUN npm ci --only=production

COPY packages/sdc2-frontend packages/sdc2-frontend

RUN npm run build -w sdc2-frontend

FROM node:18 as DEPENDENCIES

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/sdc2-client/package.json packages/sdc2-client/
COPY packages/sdc2-client-bme280/package.json packages/sdc2-client-bme280/
COPY packages/sdc2-client-dht22/package.json packages/sdc2-client-dht22/
COPY packages/sdc2-client-hcsr501/package.json packages/sdc2-client-hcsr501/
COPY packages/sdc2-client-mijia/package.json packages/sdc2-client-mijia/
COPY packages/sdc2-client-weather/package.json packages/sdc2-client-weather/
COPY packages/sdc2-logger/package.json packages/sdc2-logger/
COPY packages/sdc2-server/package.json packages/sdc2-server/

RUN npm ci --only=production

COPY . .

FROM node:18-alpine as TARGET

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=DEPENDENCIES /usr/src/app ./

COPY --from=FRONTEND /usr/src/app/packages/sdc2-frontend/build ./packages/sdc2-frontend/build

CMD ["npm", "run", "start", "-w", "sdc2-server"]
