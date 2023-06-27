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
export class AppGateway {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly gameUserService: UserGameService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('MessageGateway');

	@SubscribeMessage('joinWaitRoom')
	async handleJoinWaitRoom(client: Socket, payload: any): Promise<void> {
		console.log('joinWaitRoom');
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		let isRanked = payload.isRanked ? true : false;
		if (!user) return;
		let previousGameUG = await this.gameUserService.findNotFinishedByLogin(
			user.login,
		);

		if (previousGameUG) {
			let previousGame = await this.gameService.findById(
				previousGameUG.dataValues.gameId,
			);
			client.emit('startGame', {
				//TODO: better handling of previous game
				startingPlayer: previousGame.users[0].dataValues.login,
				isRanked: previousGame.dataValues.isRanked,
				gameId: previousGame.dataValues.id,
			});
		}
		let game = await this.gameService.findWaiting();
		if (!game) {
			game = await this.gameService.create({
				isRanked: isRanked,
				users: [user],
				modifiers: [],
				status: 'waiting',
			});
		} else {
			game.users.push(user);
			await game.$set('users', game.users);
			await game.save();
		}
		client.join(`game-${game.id}`);
		console.log(`User ${user.login} joined game ${game.id}`);
		if (game.dataValues.users.length == 2) {
			let players = game.users.map((user) => {
				return user.login;
			});
			this.server.to(`game-${game.id}`).volatile.emit('startGame', {
				firstPlayer: players[Math.floor(Math.random() * 2)],
				gameId: game.dataValues.id,
			});
		}
	}

	// @SubscribeMessage('movePaddle')
	// async handleMovePaddle(client: Socket, payload: any): Promise<void> {
	// 	let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
	// 	let user = await this.userService.findByLogin(auth.login);
	// 	if (!user) return;

	// 	console.log(payload);
	// 	let game = await this.gameService.findById(payload.gameId);
	// 	if (!game) return;

	// 	let player = game.users.find((user) => {
	// 		return user.login == auth.login;
	// 	});
	// 	if (!player) return;

	// 	client.to(`game-${game.id}`).volatile.emit('movePaddle', {
	// 		player: player.login,
	// 		position: payload.position,
	// 	});
	// }

	@SubscribeMessage('keys')
	async handleKeys(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		if (!user) return;
		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;
		let player = game.users.find((user) => {
			return user.login == auth.login;
		});
		if (!player) return;
		client.to(`game-${game.id}`).volatile.emit('keys', {
			player: player.login,
			keys: payload.keys,
		});
	}

	@SubscribeMessage('bounceBall')
	async handleBounceBall(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		if (!user) return;

		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;

		let player = game.users.find((user) => {
			return user.login == auth.login;
		});
		if (!player) return;

		this.server.to(`game-${game.id}`).volatile.emit('bounceBall', {
			ball: payload.ball,
		});
	}

	@SubscribeMessage('markGoal')
	async handleMarkGoal(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		if (!user) return;

		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;

		let player = game.users.find((user) => {
			return user.login == auth.login;
		});
		if (!player) return;

		this.server.to(`game-${game.id}`).volatile.emit('markGoal', {
			score: payload.score,
			ball: payload.ball,
			playerToPlay: payload.playerToPlay,
		});
	}

	@SubscribeMessage('requestUpdate')
	async handleRequestUpdate(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		if (!user) return;

		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;

		let player = game.users.find((user) => {
			return user.login == auth.login;
		});
		if (!player) return;
		let otherPlayer = game.users.find((user) => {
			return user.login != auth.login;
		});

		this.server.to(`game-${game.id}`).volatile.emit('requestUpdate', {
			player: otherPlayer.login,
		});
	}

	@SubscribeMessage('update')
	async handleUpdate(client: Socket, payload: any): Promise<void> {
		let auth = await jwt.verify(payload.auth, process.env.JWT_KEY);
		let user = await this.userService.findByLogin(auth.login);
		if (!user) return;

		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;

		let player = game.users.find((user) => {
			return user.login == auth.login;
		});
		if (!player) return;

		this.server.to(`game-${game.id}`).volatile.emit('update', {
			game: payload.game,
			player: player.login,
		});
	}
}
