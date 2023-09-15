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
import { Modifier } from './modifier/modifier.entity';
import { Game } from './game/game.entity';
import { observeNotification } from 'rxjs/internal/Notification';

//#region TYPES
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

type Obstacle = {
	points: { x: number; y: number }[];
	effect: (game: GameData) => void;
};

type PowerUps = {
	position: { x: number; y: number };
	size: { radius: number };
	effect: (game: GameData) => void;
};

type GameData = {
	// stuff to draw and physics
	players: Player[];
	balls: Ball[];
	obstacles: Obstacle[];
	powerUps: PowerUps[];

	// turn logic
	turn: number;
	playerToStart: number;
	isTurnStarted: boolean;
	status: {
		ended: boolean;
		winner: number;
		gonePlayer: number;
	};

	// frame logic
	lastTimestamp: number;

	// game data (fixed)
	gameId: string;
	modifiers?: Modifier[];
	height: number;
	width: number;
	loop: NodeJS.Timeout;
};
//#endregion

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

	//#region GLOBAL SOCKET HANDLING
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
	//#endregion

	/*********************************************************
	 * 														 *
	 * 					GAME HANDLING						 *
	 * 					            						 *
	 ********************************************************/

	private game: GameData[] = [];

	//#region GAME INPUTS HANDLING
	@SubscribeMessage('keys')
	async handleKeys(client: Socket, payload: any): Promise<void> {
		let game = this.game[payload.gameId];
		if (!game) return;
		let player = game.players.find((p) => p.login === payload.login);
		if (!player) return;
		player.inputs = payload.keys;
		player.lastInput = Date.now();
	}

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

	handleStartTurn(game: GameData) {
		if (game.isTurnStarted) return;
		let inputs = game.players[game.playerToStart].inputs;
		if (inputs.includes(32)) {
			//SPACE
			game.isTurnStarted = true;
			game.turn++;
		}
	}
	//#endregion

	//#region GAME MOVEMENT & RESET & POSITION HANDLING
	moveBalls(dt: number, game: GameData) {
		//TODO:
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
		game.balls = [
			{
				position: {
					x: 0,
					y: (game.height / 2 - 50) * (game.turn % 2 == 0 ? 1 : -1),
				},
				velocity: {
					dx: game.playerToStart == 0 ? -0.5 : 0.5,
					dy: game.turn % 2 == 0 ? 1 : -1,
				},
				size: { radius: 10 },
			},
		];
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

	newGame(
		gameId: string,
		player1: string,
		player2: string,
		modifiers: Modifier[],
	): GameData {
		const width = modifiers.length === 0 ? 800 : 1600;
		const height = modifiers.length === 0 ? 600 : 900;
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
			balls: [
				{
					position: { x: 0, y: 0 },
					velocity: { dx: 0, dy: 0 },
					size: { radius: 5 },
				},
			],
			powerUps: [],
			obstacles: [
				{
					//player 0 goal (left)
					points: [
						{ x: -width / 2, y: -height / 2 },
						{ x: -width / 2, y: height / 2 },
						{ x: -width / 2 - 10, y: 0 },
					],
					effect: this.score(1),
				},
				{
					// player 1 goal (right)
					points: [
						{ x: width / 2, y: -height / 2 },
						{ x: width / 2, y: height / 2 },
						{ x: width / 2 + 10, y: 0 },
					],
					effect: this.score(0),
				},
				{
					// ceiling (top)
					points: [
						{ x: -width / 2, y: -height / 2 },
						{ x: width / 2, y: -height / 2 },
						{ x: 0, y: -height / 2 - 10 },
					],
					effect: (game: GameData) => {},
				},
				{
					// floor (bottom)
					points: [
						{ x: -width / 2, y: height / 2 },
						{ x: width / 2, y: height / 2 },
						{ x: 0, y: height / 2 + 10 },
					],
					effect: (game: GameData) => {},
				},
			],
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
			modifiers: modifiers,
		};
	}
	//#endregion

	//#region GAME COLLISIONS HANDLING
	paddleObstaclesCollision(
		paddle: Player['paddle'],
		obstacles: Obstacle[],
		game: GameData,
	) {
		obstacles.forEach((obstacle) => {});
	}

	bollObstaclesCollision(ball: Ball, obstacles: Obstacle[], game: GameData) {
		obstacles.forEach((obstacle) => {});
	}

	ballPaddlesCollision(
		ball: Ball,
		paddles: Player['paddle'][],
		game: GameData,
	) {
		paddles.forEach((paddle, i) => {
			const distBallPaddleX =
				ball.position.x -
				Math.max(
					paddle.position.x - paddle.size.w / 2,
					Math.min(
						ball.position.x,
						paddle.position.x + paddle.size.w / 2,
					),
				);
			const distBallPaddleY =
				ball.position.y -
				Math.max(
					paddle.position.y - paddle.size.h / 2,
					Math.min(
						ball.position.y,
						paddle.position.y + paddle.size.h / 2,
					),
				);
			const distanceBallPaddleSquared =
				distBallPaddleX ** 2 + distBallPaddleY ** 2;
			const isBallInPaddle =
				distanceBallPaddleSquared < ball.size.radius ** 2;
			if (!isBallInPaddle) return;
			ball.velocity.dx = 1 - 2 * i;
			ball.position.y +=
				(ball.velocity.dy *
					(paddle.position.x +
						(paddle.size.w / 2 + ball.size.radius / 2) *
							Math.sign(ball.velocity.dx) -
						ball.position.x)) /
				ball.velocity.dx;
			ball.position.x =
				paddle.position.x +
				(paddle.size.w / 2 + ball.size.radius / 2) *
					Math.sign(ball.velocity.dx);
			ball.velocity.dy =
				(ball.position.y - paddle.position.y) / (paddle.size.h / 2);
		});
	}

	ballPowerUpsCollision(ball: Ball, powerUps: PowerUps[], game: GameData) {
		powerUps.forEach((powerUp) => {
			if (
				Math.sqrt(
					Math.pow(ball.position.x - powerUp.position.x, 2) +
						Math.pow(ball.position.y - powerUp.position.y, 2),
				) <
				ball.size.radius + powerUp.size.radius
			) {
				powerUp.effect(game);
				game.powerUps = game.powerUps.filter((p) => p !== powerUp);
			}
		});
	}

	checkCollisions(game: GameData) {
		game.players.forEach((player) => {
			this.paddleObstaclesCollision(player.paddle, game.obstacles, game);
		});
		game.balls.forEach((ball) => {
			this.ballPaddlesCollision(
				ball,
				game.players.map((p) => p.paddle),
				game,
			);
			this.bollObstaclesCollision(ball, game.obstacles, game);
			this.ballPowerUpsCollision(ball, game.powerUps, game);
		});
	}
	//#endregion

	//#region GAME BORING STUFF
	startGame(
		gameId: string,
		player1: string,
		player2: string,
		modifiers: Modifier[],
	) {
		this.game.length = this.game?.length | (0 + 1);
		this.game[gameId] = this.newGame(gameId, player1, player2, modifiers);
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
				this.moveBalls(dt, game);
				this.checkCollisions(game);
			} else this.handleStartTurn(game);
			this.server.to(`game-${gameId}`).emit('gameUpdate', game);
		}, 16 /* 60 fps */);
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

	score(player: number) {
		return (game: GameData) => {
			game.players[player].score++;
			this.resetBall(game);
			this.resetPaddles(game);
			game.isTurnStarted = false;
			game.playerToStart = 1 - player;
			game.turn++;
		};
	}
	//#endregion

	//#region GAME CONNECTION HANDLING
	@SubscribeMessage('createGame')
	async createGame(client: Socket, payload: any): Promise<string> {
		let user = await this.userService.verify(payload.auth);
		if (!user) throw new HttpException('Unauthorized', 401);

		let games = await this.userGameService.findNotFinishedByLogin(
			user.login,
		);

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
		if (!payload.gameId || !payload.auth)
			return { action: 'error', message: 'missing data' };
		const game = await this.gameService.findById(payload.gameId);
		const user = await this.userService.verify(payload.auth);

		if (!user) return { action: 'error', message: 'user not recognised' };
		if (!game) return { action: 'error', message: 'game not recognised' }; //NOTE: might change that to a redirect to create a game with the same modifiers, but need to have the modifiers in the payload

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
			this.gameService.update({
				...game.dataValues,
				status: 'ongoing',
			});
			this.startGame(
				game.id,
				game.users[0].login,
				game.users[1].login,
				game.dataValues.modifiers,
			);
			return { action: 'play' };
		}

		return { action: 'wait' };
	}

	@SubscribeMessage('leaveGame')
	async handleLeaveGame(client: Socket, payload: any): Promise<void> {
		let user = await this.userService.verify(payload.auth);
		if (!user) return;

		let game = await this.gameService.findById(payload.gameId);
		if (!game) return;

		if (game.dataValues.status === 'waiting') {
			this.gameService.delete(game.id);
		}
	}
	//#endregion

	//#region STATUS HANDLING
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
		// find the key of the status array that has the same socketId as client.id
		const login = Object.keys(this.status).find(
			(key) => this.status[key].socketId === client.id,
		);
		if (!login) return;

		let games = await this.userGameService.findNotFinishedByLogin(login);
		games
			.filter((g) => g.dataValues.game.status === 'waiting')
			.forEach((g) => {
				this.gameService.delete(g.dataValues.game.id);
			});

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

	//#endregion
}
