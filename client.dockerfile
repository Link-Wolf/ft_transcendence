FROM node

WORKDIR /usr/src

COPY client/package.json ./
COPY client/package-lock.json ./

COPY client/public/ ./public
COPY client/tsconfig.json ./

COPY .env ./

RUN npm i
RUN npm i sharp

CMD ["npm", "start"]

