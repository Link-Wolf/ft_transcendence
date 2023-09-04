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
import { GameService } from './game/game.service';
import { UserService } from './user/user.service';
import { UserGameService } from './user-game/user-game.service';
import { AuthService } from './auth/auth.service';
import { async } from 'rxjs';

type Player = {
	paddle: {
		size: {
			w: number;
			h: number;
		};
		position: {
			x: number;
			y: number;
		};
		velocity: {
			dx: number;
			dy: number;
		};
	};
	score: number;
	inputs: number[];
	login: string;
};

type Ball = {
	size: {
		radius: number;
	};
	position: {
		x: number;
		y: number;
	};
	velocity: {
		dx: number;
		dy: number;
	};
};

type GameData = {
	players: Player[];
	ball: Ball;
	turn: number;
	playerToStart: number;
	isTurnStarted: boolean;
	gameId: number;
	lastTimestamp: number;
	height: number;
	width: number;
	status: {
		ended: boolean;
		winner: number;
		gonePlayer: number;
	};
	loop: NodeJS.Timeout;
};
@WebSocketGateway({
	cors: {
		origin: '*',
	},
	cookie: true,
})
export class AppGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private userService: UserService,
		private gameService: GameService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {}

	/*********************************************************
	 * 														 *
	 * 					MESSAGES HANDLING 					 *
	 * 					            						 *
	 ********************************************************/
	@SubscribeMessage('newMessage')
	async notifyUpdate(client: Socket, payload: any) {
		this.server.emit('newMessage', payload.channel);
	}

	@SubscribeMessage('relationUpdate')
	async handleRelationUpdate(client: Socket, payload: any) {
		this.server.emit('relationUpdate', payload);
	}

	@SubscribeMessage('membershipUpdate')
	async handleMembershipUpdate(client: Socket, payload: any) {
		this.server.emit('membershipUpdate', payload);
	}

	/*********************************************************
	 * 														 *
	 * 					GAME HANDLING						 *
	 * 					            						 *
	 ********************************************************/

	//TODO: handle properly quittage de game en cours -> plein de trucs a devoir gerer
	private game: GameData[] = [];

	handleInputs(game: GameData) {
		game.players.forEach((player) => {
			let inputs = player.inputs;
			player.paddle.velocity.dy = 0;
			if (inputs.includes(38) || inputs.includes(87)) {
				//UP or W
				player.paddle.velocity.dy -= 1;
			}
			if (inputs.includes(40) || inputs.includes(83)) {
				//DOWN or S
				player.paddle.velocity.dy += 1;
			}
		});
	}

	moveBall(dt: number, game: GameData) {
		game.ball.position.x += game.ball.velocity.dx * dt;
		game.ball.position.y += game.ball.velocity.dy * dt;
	}

	movePaddles(dt: number, game: GameData) {
		game.players.forEach((player) => {
			player.paddle.position.y += player.paddle.velocity.dy * dt;
			if (
				player.paddle.position.y + player.paddle.size.h / 2 >
				game.height / 2
			) {
				player.paddle.position.y =
					game.height / 2 - player.paddle.size.h / 2;
			}
			if (
				player.paddle.position.y - player.paddle.size.h / 2 <
				-game.height / 2
			) {
				player.paddle.position.y =
					-game.height / 2 + player.paddle.size.h / 2;
			}
		});
	}

	resetBall(game: GameData) {
		game.ball.position.x = 0;
		game.ball.position.y =
			(game.height / 2 - 50) * (game.turn % 2 == 0 ? 1 : -1);
		game.ball.velocity.dx = game.playerToStart == 0 ? -0.5 : 0.5;
		game.ball.velocity.dy = game.turn % 2 == 0 ? 1 : -1;
		game.ball.size.radius = 10;
	}

	resetPaddles(game: GameData) {
		game.players.forEach((player, i) => {
			player.paddle.position.y = 0;
			player.paddle.velocity.dy = 0;
			player.paddle.position.x = i == 0 ? -350 : 350;
			player.paddle.size.w = 8 * 1;
			player.paddle.size.h = 8 * 7;
		});
	}

	bounceOnWalls = (game: GameData) => {
		//get all values in shorter variables
		const ballY = game.ball.position.y;
		const signOfY = Math.sign(ballY);
		if (signOfY == 0) return;

		const ballX = game.ball.position.x;
		const ballRadius = game.ball.size.radius;

		//check if ball is in wall
		const ballIsInWall =
			Math.abs(ballY + ballRadius * signOfY) > Math.abs(game.height / 2);
		if (!ballIsInWall) return;

		//	calculate new ball position and velocity
		// The ball go in direction of x=0
		const newBallDy = -Math.abs(game.ball.velocity.dy) * signOfY;
		// The ball is placed tangent to the wall
		const newBallY = (game.height / 2 - ballRadius) * signOfY;
		const newBallX =
			ballX +
			(game.ball.velocity.dx / game.ball.velocity.dy) *
				(signOfY * (game.height / 2 - ballRadius) - ballY);

		//apply new ball position and velocity
		game.ball.velocity.dy = newBallDy;
		game.ball.position.y = newBallY;
		game.ball.position.x = newBallX;
	};

	checkCollisions(game: GameData) {
		this.bounceOnWalls(game);
		game.players.forEach((player, i) => {
			const paddle = player.paddle;
			const distBallPaddleX =
				game.ball.position.x -
				Math.max(
					paddle.position.x - paddle.size.w / 2,
					Math.min(
						game.ball.position.x,
						paddle.position.x + paddle.size.w / 2,
					),
				);
			const distBallPaddleY =
				game.ball.position.y -
				Math.max(
					paddle.position.y - paddle.size.h / 2,
					Math.min(
						game.ball.position.y,
						paddle.position.y + paddle.size.h / 2,
					),
				);
			const distanceBallPaddleSquared =
				distBallPaddleX ** 2 + distBallPaddleY ** 2;
			const isBallInPaddle =
				distanceBallPaddleSquared < game.ball.size.radius ** 2;
			if (!isBallInPaddle) return;
			game.ball.velocity.dx = 1 - 2 * i;
			game.ball.position.y +=
				(game.ball.velocity.dy *
					(paddle.position.x +
						(paddle.size.w / 2 + game.ball.size.radius / 2) *
							Math.sign(game.ball.velocity.dx) -
						game.ball.position.x)) /
				game.ball.velocity.dx;
			game.ball.position.x =
				paddle.position.x +
				(paddle.size.w / 2 + game.ball.size.radius / 2) *
					Math.sign(game.ball.velocity.dx);
			game.ball.velocity.dy =
				(game.ball.position.y - paddle.position.y) /
				(paddle.size.h / 2);
		});

		const checkForScore = (n: number) => {
			game.players[n].score++;
			game.playerToStart = 1 - n;
			game.isTurnStarted = false;
			this.resetBall(game);
			// this.resetPaddles();
			if (game.players[n].score >= 11) {
				game.status.ended = true;
				game.status.winner = n;
			}
		};
		//score on player 0 goal
		if (game.ball.position.x < -game.width / 2) checkForScore(1);
		// score on player 1 goal
		if (game.ball.position.x > game.width / 2) checkForScore(0);
	}

	handleStartTurn(game: GameData) {
		if (game.isTurnStarted) return;
		let inputs = game.players[game.playerToStart].inputs;
		if (inputs.includes(32)) {
			//SPACE
			game.isTurnStarted = true;
			game.turn++;
		}
	}

	newGame(gameId: number, player1: string, player2: string): GameData {
		const width = 800; //TODO: check for modifiers and adapt if needed
		const height = 600; //TODO: check for modifiers and adapt if needed
		return {
			gameId: gameId,
			players: [
				{
					login: player1,
					score: 0,
					paddle: {
						position: { x: -width / 2 + 10, y: 0 },
						size: { w: 10, h: 50 },
						velocity: { dx: 0, dy: 0 },
					},
					inputs: [],
				},
				{
					login: player2,
					score: 0,
					paddle: {
						position: { x: width / 2 - 10, y: 0 },
						size: { w: 10, h: 50 },
						velocity: { dx: 0, dy: 0 },
					},
					inputs: [],
				},
			],
			ball: {
				position: { x: 0, y: 0 },
				velocity: { dx: 0, dy: 0 },
				size: { radius: 5 },
			},
			width: width,
			height: height,
			lastTimestamp: Date.now(),
			playerToStart: 0,
			isTurnStarted: false,
			turn: 0,
			status: {
				ended: false,
				winner: null,
				gonePlayer: null,
			},
			loop: null,
		};
	}

	startGame(gameId: number, player1: string, player2: string) {
		this.game.length = Math.max(this.game?.length | 0, gameId + 1);
		this.game[gameId] = this.newGame(gameId, player1, player2);
		let game = this.game[gameId];
		this.resetBall(game);
		this.resetPaddles(game);
		game.loop = setInterval(() => {
			//update dt
			let now = Date.now();
			let dt = now - game.lastTimestamp;
			game.lastTimestamp = now;

			// check for final score
			if (game.players[0].score >= 11 || game.players[1].score >= 11) {
				game.status.ended = true;
				game.status.winner = game.players[0].score >= 11 ? 0 : 1;
				this.server.to(`game-${gameId}`).emit('gameUpdate', game);
				this.stopGame(game);
				return;
			}

			// if turn is started, update the game
			this.handleInputs(game);
			this.movePaddles(dt, game);
			if (game.isTurnStarted) {
				this.moveBall(dt, game);
				this.checkCollisions(game);
			} else this.handleStartTurn(game);
			this.server.to(`game-${gameId}`).emit('gameUpdate', game);
		}, 16);
	}

	stopGame(game: GameData, abort: boolean = false) {
		//TODO: uaw argument to abort instead of finish
		//TODO: update score in db
		if (!game) return;
		clearInterval(game.loop);
		this.game[game.gameId] = null;
		this.gameService.update({
			id: game.gameId,
			status: 'finished',
		});
	}

	@SubscribeMessage('joinWaitRoom')
	async handleJoinWaitRoom(client: Socket, payload: any): Promise<void> {
		//TODO: change status to waiting
		// //verifiy the user

		let user = await this.userService.verify(payload.auth);
		if (!user) return;

		let ongoingGames = await this.gameService.findOngoing(
			user.dataValues.login,
		);
		if (ongoingGames.length > 0) {
			client.emit('startGame', {
				gameId: ongoingGames[0].id,
				isNew: false,
			});
			client.join(`game-${ongoingGames[0].id}`);
			return;
		}

		let waitingGame = await this.gameService.findWaiting(payload.isRanked);
		userA: if (!waitingGame) {
			waitingGame = await this.gameService.create({
				isRanked: payload.isRanked,
				status: 'waiting',
				users: [],
				modifiers: [],
			});
		}
		waitingGame.$set('users', [...waitingGame.dataValues.users, user]);
		await waitingGame.save();

		client.join(`game-${waitingGame.id}`);

		if (waitingGame.dataValues.users.length === 2) {
			await this.gameService.update({
				id: waitingGame.id,
				status: 'ongoing',
			});
			this.startGame(
				waitingGame.id,
				waitingGame.users[0].login,
				waitingGame.users[1].login,
			);
			this.server.to(`game-${waitingGame.id}`).emit('startGame', {
				gameId: waitingGame.id,
				isNew: true,
			});
		}
	}

	@SubscribeMessage('quitWaitRoom')
	async handleQuitWaitRoom(client: Socket, payload: any): Promise<number> {
		// TODO: change status to online
		let user = await this.userService.verify(payload.auth);
		if (!user) return 400;

		let waitingGame = await this.gameService.findWaiting(payload.isRanked); //XXX: wtf?
		if (!waitingGame) {
			console.log('no waiting game', waitingGame);
			return 400;
		}

		if (waitingGame.dataValues.users.length === 1) {
			console.log('delete game');
			await this.gameService.delete(waitingGame.id);
			return 200;
		}

		console.log('nop');
		return 400;
	}

	@SubscribeMessage('keys')
	async handleKeys(client: Socket, payload: any): Promise<void> {
		let game = this.game[payload.gameId];
		if (!game) return;
		let player = game.players.find((p) => p.login === payload.login);
		if (!player) return;
		player.inputs = payload.keys;
	}

	/*********************************************************
	 * 														 *
	 * 					STATUS HANDLING						 *
	 * 					            						 *
	 ********************************************************/

	handleConnection(client: Socket) {}

	private status: {
		[login: string]: {
			status: string;
			socketId: string;
		};
	} = {};

	@SubscribeMessage('getStatus')
	async handleGetStatus(client: Socket, payload: any): Promise<string> {
		if (!this.status[payload.login]) return 'offline';
		return this.status[payload.login].status;
	}

	statusUpdate = async (login: string, status: string, socketId: string) => {
		this.status[login] = {
			status: status,
			socketId: socketId,
		};

		this.server.emit('statusUpdate', {
			login: login,
			status: status,
		});

		this.logger.log(`User ${login} is now ${status} on socket ${socketId}`);
	};

	async handleDisconnect(client: Socket, ...args: any[]) {
		let login = Object.keys(this.status).find((login) => {
			this.status[login].socketId === client.id;
		});
		if (!login) return;

		let game = this.game.find((g) => {
			return g.players.find((p) => p.login === login);
		});
		if (game) this.stopGame(this.game[game.gameId]);

		await this.statusUpdate(login, 'offline', null);
	}

	@SubscribeMessage('log')
	async handleLog(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.verify(payload.auth);
		if (!user) return;

		await this.statusUpdate(user.login, 'online', client.id);
	}

	@SubscribeMessage('away')
	async handleAway(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.verify(payload.auth);
		if (!user) return;

		await this.statusUpdate(user.login, 'away', client.id);
	}

	@SubscribeMessage('back')
	async handleBack(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.verify(payload.auth);
		if (!user) return;

		await this.statusUpdate(user.login, 'online', client.id);
	}
}
