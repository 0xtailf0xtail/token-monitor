FROM node:16.11.1-alpine3.14
RUN mkdir /token-monitor
COPY . /token-monitor
WORKDIR /token-monitor

RUN yarn && yarn build

CMD ["yarn", "start"]