all: up

up:
	docker-compose up

re: fclean
	docker-compose up --build

nocache: fclean
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

.PHONY: all up re clean stop start
