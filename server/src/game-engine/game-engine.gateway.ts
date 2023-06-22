import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameService } from 'src/game/game.service';
import { UserService } from 'src/user/user.service';
import { UserGameService } from 'src/user-game/user-game.service';

@WebSocketGateway({
	cors: {
		origin: '*',
		credentials: true,
	},
})
export class GameEngineGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly gameUserService: UserGameService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('MessageGateway');

	@SubscribeMessage('joinWaitRoom')
	async handleJoinWaitRoom(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		let isRanked = payload.isRanked ? true : false;
		if (!user) return;
		if (await this.gameUserService.findNotFinishedByLogin(user.login)) return;
		let game = await this.gameService.findWaiting();
		if (!game) {
			game = await this.gameService.create({
				isRanked: isRanked,
				users: [user],
				modifiers: [],
				status: 'waiting',
			});
		}
		else {
			game.users.push(user);
			await this.gameService.update(game);
		}
		client.join(`game-${game.id}`);
		if (game.users.length == 2) {
			let players = game.users.map((user) => {
				return user.login})
			this.server.to(`game-${game.id}`).emit('startGame', {
				startingPlayer: players[Math.floor(Math.random() * 2)],
			});
		}
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}
