all: env docker

env:
	cp .env client/.env
	cp .env server/.env

docker:
	docker-compose up --build

.PHONY: all env docker
