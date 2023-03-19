FROM --platform=$BUILDPLATFORM node:19 as FRONTEND

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/frontend/package.json packages/frontend/

RUN npm ci --no-audit --no-fund

COPY packages/frontend packages/frontend

RUN npm run build -w frontend

FROM node:19 as DEPENDENCIES

WORKDIR /usr/src/app

COPY package*.json ./
COPY packages/sdc2-client/package.json packages/sdc2-client/
COPY packages/sdc2-client-bme280/package.json packages/sdc2-client-bme280/
COPY packages/sdc2-client-dht22/package.json packages/sdc2-client-dht22/
COPY packages/sdc2-client-hcsr501/package.json packages/sdc2-client-hcsr501/
COPY packages/sdc2-client-mijia/package.json packages/sdc2-client-mijia/
COPY packages/sdc2-client-weather/package.json packages/sdc2-client-weather/
COPY packages/sdc2-client-senseair/package.json packages/sdc2-client-senseair/
COPY packages/logger/package.json packages/logger/
COPY packages/backend/package.json packages/backend/

RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

FROM node:19-slim as TARGET

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=DEPENDENCIES /usr/src/app ./

COPY --from=FRONTEND /usr/src/app/packages/frontend/build ./packages/frontend/build

CMD ["npm", "run", "start", "-w", "backend"]
