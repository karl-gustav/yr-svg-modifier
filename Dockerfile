FROM node:17-alpine

WORKDIR app

COPY package*.json ./

RUN npm install --production

COPY *.js ./

CMD [ "node", "main.js" ]
