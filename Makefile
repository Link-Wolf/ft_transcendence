all: env up

env:
	cp .env client/.env
	cp .env server/.env

up:
	docker-compose up

re: env
	docker-compose up --build

.PHONY: all env up
