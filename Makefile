NAME = ft_transcendence

$(NAME): server client

server:
	@make -C ./server

client:
	@make -C ./client

.PHONY: server client