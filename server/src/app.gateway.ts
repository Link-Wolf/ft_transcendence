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
import { HttpException } from '@nestjs/common';
import { ModifierService } from './modifier/modifier.service';

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
	lastInput: number;
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
	gameId: string;
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
		private userGameService: UserGameService,
		private modifierService: ModifierService,
	) {}

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('AppGateway');

	afterInit(server: Server) {}

	/*********************************************************
	 * 														 *
	 * 				GLOBAL SOCKET HANDLING 					 *
	 * 					            						 *
	 ********************************************************/
	@SubscribeMessage('newMessage')
	async notifyUpdate(client: Socket, payload: any) {
		this.server.emit('newMessage', payload);
	}

	@SubscribeMessage('relationUpdate')
	async handleRelationUpdate(client: Socket, payload: any) {
		this.server.emit('relationUpdate', payload);
	}

	@SubscribeMessage('membershipUpdate')
	async handleMembershipUpdate(client: Socket, payload: any) {
		this.server.emit('membershipUpdate', payload);
	}

	@SubscribeMessage('contextUpdate')
	async handleContextUpdate(client: Socket, payload: any) {
		client.emit('contextUpdate', payload);
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

	newGame(gameId: string, player1: string, player2: string): GameData {
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
					lastInput: Date.now(),
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
					lastInput: Date.now(),
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

	abortGame(game: GameData, player: number | string) {
		if (typeof player === 'string') {
			player = game.players.findIndex((p) => p.login === player);
		}

		game.players[1 - player].score = 11;
		game.status.winner = 1 - player;
		game.players[player].score = 0;
		game.status.ended = true;
		this.server.to(`game-${game.gameId}`).emit('gameUpdate', game);
		this.stopGame(game, true);
	}

	startGame(gameId: string, player1: string, player2: string) {
		this.game.length = this.game?.length | (0 + 1);
		this.game[gameId] = this.newGame(gameId, player1, player2);
		let game = this.game[gameId];
		this.resetBall(game);
		this.resetPaddles(game);

		// TODO: check if player are online and, if not, abort the game
		// this.status[player1].status = 'ingame';
		// this.status[player2].status = 'ingame';

		game.loop = setInterval(() => {
			//update dt
			let now = Date.now();
			let dt = now - game.lastTimestamp;
			game.lastTimestamp = now;

			if (game.players[0].lastInput + 1000 * 60 < now) {
				this.abortGame(game, 0);
			}
			if (game.players[1].lastInput + 1000 * 60 < now) {
				this.abortGame(game, 1);
			}

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

	stopGame(game: GameData, abandoned = false) {
		if (!game) return;
		clearInterval(game.loop);
		this.game[game.gameId] = null;
		this.gameService.update({
			id: game.gameId,
			status: abandoned ? 'abandoned' : 'finished',
		});

		this.saveScore(game);
	}

	async saveScore(game: GameData) {
		let dbGame = await this.gameService.findById(game.gameId);
		let dbUser0 = await this.userService.findByLogin(game.players[0].login);
		let dbUser1 = await this.userService.findByLogin(game.players[1].login);

		this.userGameService.update({
			game: dbGame,
			user: dbUser0,
			score: game.players[0].score,
		});
		this.userGameService.update({
			score: game.players[1].score,
			game: dbGame,
			user: dbUser1,
		});
	}

	@SubscribeMessage('keys')
	async handleKeys(client: Socket, payload: any): Promise<void> {
		let game = this.game[payload.gameId];
		if (!game) return;
		let player = game.players.find((p) => p.login === payload.login);
		if (!player) return;
		player.inputs = payload.keys;
		player.lastInput = Date.now();
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
		if (game) {
			this.abortGame(game, login);
		}

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

	/*********************************************************
	 * 														 *
	 * 		        GAME CONNECTION HANDLING				 *
	 * 					            						 *
	 ********************************************************/

	@SubscribeMessage('createGame')
	async createGame(client: Socket, payload: any): Promise<string> {
		let user = await this.userService.verify(payload.auth);
		if (!user) throw new HttpException('Unauthorized', 401);

		let games = await this.userGameService.findNotFinishedByLogin(
			user.login,
		);

		// Check if the player is currently playing a game
		let ongoingGames = games.filter(
			(g) => g.dataValues.game.status === 'ongoing',
		);
		if (ongoingGames.length > 0) {
			return ongoingGames[0].dataValues.game.id;
		}

		// Check if the player is waiting for a game that has the same modifiers and ranked status
		games = games.filter(
			(g) => g.dataValues.game.dataValues.isRanked === payload.isRanked,
		);
		games = games.filter((g) => {
			return (
				(g.dataValues.game.dataValues.modifiers ?? [])
					.map((mod) => mod.dataValues.id)
					.sort() === payload.modifierIds.sort()
			);
		});
		if (games.length > 0) {
			return games[0].dataValues.game.id;
		}

		// Create a new game for the player
		let game = await this.gameService.create({
			isRanked: payload.isRanked,
			status: 'waiting',
		});

		// Add the player to the game
		const modifiers = await this.modifierService.findByIds(
			payload.modifierIds ?? [],
		);

		await game.$add('users', user);
		for (const modifier of modifiers) {
			await game.$add('modifiers', modifier);
		}
		await game.save();

		return game.id;
	}

	@SubscribeMessage('joinGame')
	async handleJoinWaitRoom(
		client: Socket,
		payload: any,
	): Promise<{
		action: 'redirect' | 'play' | 'wait' | 'error';
		newId?: string;
		message?: string;
	}> {
		console.log('joinGame', payload);
		if (!payload.gameId || !payload.auth)
			return { action: 'error', message: 'missing data' };
		const game = await this.gameService.findById(payload.gameId);
		const user = await this.userService.verify(payload.auth);

		if (!user) return { action: 'error', message: 'user not recognised' };

		if (game.dataValues.status === 'ongoing') {
			if (
				game.dataValues.users.some(
					(u) => u.dataValues.login === user.dataValues.login,
				)
			) {
				client.join(`game-${game.id}`);
				return { action: 'play' };
			}
		}

		const playableGames = await this.gameService.findPlayable(user.login);

		if (!playableGames.some((g) => g.dataValues.id === game.dataValues.id))
			return { action: 'error', message: 'game not playable' };

		if (!game.users.some((u) => u.login === user.login))
			await game.$add('users', user);
		client.join(`game-${game.id}`);

		if (game.dataValues.users.length === 2) {
			console.log('game', game);
			this.gameService.update({
				...game.dataValues,
				status: 'ongoing',
			});
			this.startGame(game.id, game.users[0].login, game.users[1].login);
			return { action: 'play' };
		}

		return { action: 'wait' };

		//TODO: change status to waiting

		// let user = await this.userService.verify(payload.auth);
		// if (!user) return;

		// let ongoingGames = await this.gameService.findOngoing(
		// 	user.dataValues.login,
		// );
		// if (ongoingGames.length > 0) {
		// 	client.emit('startGame', {
		// 		gameId: ongoingGames[0].id,
		// 		isNew: false,
		// 	});
		// 	client.join(`game-${ongoingGames[0].id}`);
		// 	return;
		// }

		// let waitingGame = await this.gameService.findWaiting(payload.isRanked);
		// if (!waitingGame) {
		// 	waitingGame = await this.gameService.create({
		// 		isRanked: payload.isRanked,
		// 		status: 'waiting',
		// 		users: [],
		// 		modifiers: [],
		// 	});
		// }
		// waitingGame.$set('users', [...waitingGame.dataValues.users, user]);
		// await waitingGame.save();

		// client.join(`game-${waitingGame.id}`);

		// if (waitingGame.dataValues.users.length === 2) {
		// 	await this.gameService.update({
		// 		id: waitingGame.id,
		// 		status: 'ongoing',
		// 	});
		// 	this.startGame(
		// 		waitingGame.id,
		// 		waitingGame.users[0].login,
		// 		waitingGame.users[1].login,
		// 	);
		// 	this.server.to(`game-${waitingGame.id}`).emit('startGame', {
		// 		gameId: waitingGame.id,
		// 		isNew: true,
		// 	});
		// }
	}
}
