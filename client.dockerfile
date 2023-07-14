FROM node

WORKDIR /usr/src

COPY client/package.json ./
COPY client/package-lock.json ./

COPY client/public/ ./public
COPY client/tsconfig.json ./

COPY .env ./

RUN npm i

CMD ["npm", "start"]
# CMD ["sleep", "infinity"]

