all: up

up:
	docker-compose up --build

re: fclean up

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
	docker volume rm -f ft_transcendence_database_data
	docker system prune -fa --volumes

.PHONY: all up re clean stop start
