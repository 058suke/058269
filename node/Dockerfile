FROM node:16.19-alpine3.16

ENV LANG=js_JP.UTF-8
ENV HOME=/home/node
ENV APP_HOME="$HOME/058269"

WORKDIR $APP_HOME

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

COPY package*.json ./

RUN npm install

RUN chown -R node:node .

USER node

RUN echo "WORKDIR is $WORKDIR . HOME is $HOME . LANG is $LANG ." && npm config list

RUN npm config list

ENV NODE_ENV=development
