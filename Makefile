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

clean: stop
	docker-compose down

stop:
	docker-compose stop

start:
	docker-compose start

fclean: clean
	docker-compose rm -f

.PHONY: all env up re clean stop start
