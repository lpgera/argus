FROM node:14 as BUILD_IMAGE

WORKDIR /usr/src/app

COPY . .

RUN npx lerna bootstrap && npm cache clean --force

RUN npx lerna run build --stream --scope=sdc2-frontend

FROM node:14-alpine as TARGET_IMAGE

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app ./

CMD ["npx", "lerna", "run", "start", "--stream", "--scope=sdc2-server"]
