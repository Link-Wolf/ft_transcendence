FROM node

WORKDIR /usr/src

COPY server/package.json ./
COPY server/package-lock.json ./

COPY server/tsconfig.json ./

COPY .env ./

RUN npm i sharp
RUN npm i

CMD ["npm", "run", "start:dev"]
# CMD ["sleep", "infinity"]
