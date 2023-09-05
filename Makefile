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
	docker-compose rm -f

stop:
	docker-compose stop

start:
	docker-compose start

fclean: clean
	docker system prune -fa --volumes

.PHONY: all up re clean stop start
