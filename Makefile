all: env up

env:
	cp .env client/.env
	cp .env server/.env

up:
	docker-compose up

re: env
	docker-compose up --build

nocache: env
	docker-compose build --no-cache
	docker-compose up

clean:
	docker-compose down

stop:
	docker-compose stop

start:
	docker-compose start

.PHONY: all env up re clean stop start
