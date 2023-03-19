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
COPY packages/clients/base-client/package.json packages/clients/base-client/
COPY packages/clients/bme280/package.json packages/clients/bme280/
COPY packages/clients/dht22/package.json packages/clients/dht22/
COPY packages/clients/hcsr501/package.json packages/clients/hcsr501/
COPY packages/clients/mijia/package.json packages/clients/mijia/
COPY packages/clients/weather/package.json packages/clients/weather/
COPY packages/clients/senseair/package.json packages/clients/senseair/
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
