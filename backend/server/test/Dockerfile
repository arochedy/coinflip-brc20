FROM node:16-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./package.json /usr/src/app/

RUN apk add --update python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk --no-cache --virtual build-dependencies add git make g++ \
    && apk add curl \
    && git config --global url."https://".insteadOf git:// \
    && yarn install \
    && yarn cache clean --force \
    && apk del build-dependencies \
    && apk add git bash

COPY . /usr/src/app

COPY entrypoint.sh /usr/src/app

RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
CMD ["yarn","test"]
