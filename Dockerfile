FROM node:14 as FRONTEND

WORKDIR /usr/src/app

COPY . .

RUN npx lerna bootstrap --hoist --scope=sdc2-frontend

RUN npx lerna run build --stream --scope=sdc2-frontend

FROM node:14 as DEPENDENCIES

WORKDIR /usr/src/app

COPY . .

RUN npx lerna bootstrap --hoist --ignore=sdc2-frontend && npm cache clean --force

FROM node:14-alpine as TARGET

WORKDIR /usr/src/app

COPY --from=DEPENDENCIES /usr/src/app ./

COPY --from=FRONTEND /usr/src/app/packages/sdc2-frontend/build ./packages/sdc2-frontend/build

CMD ["npx", "lerna", "run", "start", "--stream", "--scope=sdc2-server"]
