FROM node:16 as FRONTEND

WORKDIR /usr/src/app

COPY package*.json ./
COPY lerna.json ./
COPY packages/sdc2-frontend/package.json packages/sdc2-frontend/

RUN npx lerna bootstrap --hoist --scope=sdc2-frontend

COPY packages/sdc2-frontend packages/sdc2-frontend

RUN npx lerna run build --stream --scope=sdc2-frontend

FROM node:16 as DEPENDENCIES

WORKDIR /usr/src/app

COPY package*.json ./
COPY lerna.json ./
COPY packages/sdc2-client/package.json packages/sdc2-client/
COPY packages/sdc2-client-bme280/package.json packages/sdc2-client-bme280/
COPY packages/sdc2-client-dht22/package.json packages/sdc2-client-dht22/
COPY packages/sdc2-client-hcsr501/package.json packages/sdc2-client-hcsr501/
COPY packages/sdc2-client-mijia/package.json packages/sdc2-client-mijia/
COPY packages/sdc2-client-weather/package.json packages/sdc2-client-weather/
COPY packages/sdc2-logger/package.json packages/sdc2-logger/
COPY packages/sdc2-server/package.json packages/sdc2-server/

RUN npx lerna bootstrap --hoist --ignore=sdc2-frontend && npm cache clean --force

COPY . .

FROM node:16-alpine as TARGET

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=DEPENDENCIES /usr/src/app ./

COPY --from=FRONTEND /usr/src/app/packages/sdc2-frontend/build ./packages/sdc2-frontend/build

CMD ["npx", "lerna", "run", "start", "--stream", "--scope=sdc2-server"]
