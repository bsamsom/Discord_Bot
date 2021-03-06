FROM node:15.11.0-alpine3.10    

ENV TZ = America/Winnipeg

# install mininiumal requirements
RUN apk add --update \
    && apk add --no-cache \
        ffmpeg \
        python \
        make \
        g++ \
        tzdata \
    && rm -rf /var/cache/apk/*

# create working dir
WORKDIR /usr/src/bot

#copy required setup files
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production

COPY config.json ./
COPY client_secret.json ./

# Copy everything else
COPY . .

CMD [ "node", "claptrap.js" ]

