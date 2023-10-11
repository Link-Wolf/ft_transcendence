FROM node

WORKDIR /usr/src

COPY server/package.json ./
COPY server/package-lock.json ./

COPY server/tsconfig.json ./

COPY .env ./

RUN npm i
RUN npm i sharp

CMD ["npm", "run", "start:dev"]
