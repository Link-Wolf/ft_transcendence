NAME = server

$(NAME): node_modules .env
	npm run start:dev

node_modules: package.json
	npm i --save --legacy-peer-deps

.env: ../.env
	cp ../.env .env