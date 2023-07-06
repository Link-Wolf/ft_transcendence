import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { GameService } from './game/game.service';
import { UserService } from './user/user.service';
import { UserGameService } from './user-game/user-game.service';
import { Game } from './game/game.entity';

let game = {
	player
}

@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private userService: UserService,
		private gameService: GameService,
		private usergameService: UserGameService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	/*********************************************************
	 * 														 *
	 * 					MESSAGES HANDLING 					 *
	 * 					            						 *
	 ********************************************************/
	@SubscribeMessage('newMessageDaddy')
	async notifyUpdate(client: Socket, payload: any) {
		this.server.emit('youGotMail', payload.channel);
	}

	/*********************************************************
	 * 														 *
	 * 					GAME HANDLING						 *
	 * 					            						 *
	 ********************************************************/

	//TODO: handle properly quittage de game en cours -> plein de trucs a devoir gerer

	@SubscribeMessage('joinWaitRoom')
	async handleJoinWaitRoom(client: Socket, payload: any): Promise<void> {
		//verifiy the user
		if (!payload.auth) return;
		let session = await jwt.verify(payload.auth, process.env.JWT_KEY);
		if (!session) return;
		let user = await this.userService.findByLogin(session.login);

		//get the user back from his game if he has one
		let userGame = await this.usergameService.findNotFinishedByLogin(
			user.dataValues.login,
		);
		if (userGame) {
			client.emit('startGame', {
				gameId: userGame.gameId,
				isNew: false,
			});
			return;
		}

		//if there isn't a game waiting for a player, create it
		let waitingGame = await this.gameService.findWaiting(payload.isRanked);
		if (!waitingGame) {
			waitingGame = await this.gameService.create({
				isRanked: payload.isRanked,
				status: 'waiting',
				users: [user],
				modifiers: [
					/*TODO: add modifiers from payload*/
				],
			});
			client.join(`game-${waitingGame.id}`);
		} else {
			//else, join the other player waiting
			client.join(`game-${waitingGame.id}`);
			let users = waitingGame.users;
			users.push(user);
			waitingGame.$set('users', users);
			await waitingGame.save();
			this.server.to(`game-${waitingGame.id}`).emit('startGame', {
				gameId: waitingGame.id,
				isNew: true,
				modifiers: [
					/*TODO: add modifier from payload*/
				],
				players: users.map((user) => {
					return user.login;
				}),
				playerToStart: Math.random() > 0.5 ? 0 : 1,
			});
		}
	}

	@SubscribeMessage('quitWaitRoom')
	async handleQuitWaitRoom(client: Socket, payload: any): Promise<void> {
		// Get the user
		// If waiting solo
		////// Yes: delete the game
		////// Return OK
		// Else
		////// Return nop attends
	}

	
}
