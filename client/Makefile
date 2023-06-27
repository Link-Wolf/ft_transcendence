NAME = client

$(NAME): node_modules .env
	npm start

node_modules: package.json
	npm i --save --legagcy-peer-deps

.env: ../.env
	cp ../.env .env