import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { GameService } from './game/game.service';
import { UserService } from './user/user.service';
import { UserGameService } from './user-game/user-game.service';
import { HttpException } from '@nestjs/common';
import { ModifierService } from './modifier/modifier.service';
import { Modifier } from './modifier/modifier.entity';
import { Game } from './game/game.entity';
import { observeNotification } from 'rxjs/internal/Notification';
import { BlockService } from './block/block.service';

const MAX_BALL_SPEED = 2;
const DEFAULT_BALL_SPEED = 0.8;
const DEFAULT_RANKED_BALL_SPEED = 0.5;
const MAX_PADDLE_SIZE = 0.5;
const DEFAULT_BIGGER_PADDLE_SIZE = 2.0 / 9.0;
const DEFAULT_PADDLE_SIZE = 1.0 / 6.0;
const DEFAULT_SMALLER_PADDLE_SIZE = 1.0 / 9.0;
const MIN_PADDLE_SIZE = 0.01;
const MAX_NUMBER_OF_BALLS = 10;
const POWERUP_RADIUS = 15;
const BALL_RADIUS = 8;
const RANKED_BALL_RADIUS = 5;
const PADDLE_WIDTH = 40;

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
		effect: ((ball: Ball, game: GameData) => void)[];
		color: string;
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
		px?: number;
		py?: number;
	};
	velocity: {
		dx: number;
		dy: number;
	};
	lastUser: number;
	color: string;
};

type Obstacle = {
	shape: 'circle' | 'rectangle';
	position: { x: number; y: number };
	size: { w: number; h: number };
	effect: (game: GameData) => void;
	color: string;
};

type PowerUps = {
	position: { x: number; y: number };
	size: { radius: number };
	effect: (ball: Ball, game: GameData) => void;
	name: string;
	color: string;
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
	nbBounces: number;

	// frame logic
	lastTimestamp: number;
	powerUpName: string;
	powerUpColor: string;
	powerUpDisplayDuration: number;
	screenShake: number;

	// game data (fixed)
	gameId: string;
	modifiers?: Modifier[];
	height: number;
	width: number;
	loop: NodeJS.Timeout;
	powerUpSpawnPoints: { x: number; y: number }[];
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
		private blockService: BlockService,
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

	@SubscribeMessage('friendUpdate')
	async handleFriendUpdate(client: Socket, payload: any) {
		this.server.emit('friendUpdate', payload);
	}

	@SubscribeMessage('membershipUpdate')
	async handleMembershipUpdate(client: Socket, payload: any) {
		this.server.emit('membershipUpdate', payload);
	}

	@SubscribeMessage('contextUpdate')
	async handleContextUpdate(client: Socket, payload: any) {
		this.server.emit('contextUpdate', payload);
	}

	@SubscribeMessage('askForGame')
	async handleAskForGame(client: Socket, payload: any) {
		this.server.emit('askForGame', payload);
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
		}
	}
	//#endregion

	//#region GAME MOVEMENT & RESET & POSITION HANDLING
	moveBalls(dt: number, game: GameData) {
		game.balls.forEach((ball) => {
			ball.position.px = ball.position.x;
			ball.position.py = ball.position.y;
			ball.position.x += ball.velocity.dx * dt;
			ball.position.y += ball.velocity.dy * dt;
		});
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
					dx:
						game.playerToStart == 0
							? -(game.modifiers.length > 0
									? DEFAULT_BALL_SPEED
									: DEFAULT_RANKED_BALL_SPEED)
							: game.modifiers.length > 0
							? DEFAULT_BALL_SPEED
							: DEFAULT_RANKED_BALL_SPEED,
					dy:
						game.turn % 2 == 0
							? game.modifiers.length > 0
								? DEFAULT_BALL_SPEED
								: DEFAULT_RANKED_BALL_SPEED
							: -(game.modifiers.length > 0
									? DEFAULT_BALL_SPEED
									: DEFAULT_RANKED_BALL_SPEED),
				},
				size: {
					radius:
						game.modifiers.length > 0
							? BALL_RADIUS
							: RANKED_BALL_RADIUS,
				},
				lastUser: null,
				color: 'white',
			},
		];
	}

	resetPaddles(game: GameData, modifiers: Modifier[]) {
		game.players.forEach((player, i) => {
			player.paddle.position.y = 0;
			player.paddle.velocity.dy = 0;
			player.paddle.position.x = (game.width / 2 - 25) * (i * 2 - 1);
			player.paddle.size.w = PADDLE_WIDTH;
			player.paddle.size.h = this.paddleSize(modifiers) * game.height;
			player.paddle.color = 'white';
		});
	}

	resetPaddlesSize(game: GameData, modifiers: Modifier[]) {
		game.players.forEach((player, i) => {
			player.paddle.size.w = PADDLE_WIDTH;
			player.paddle.size.h = this.paddleSize(modifiers) * game.height;
		});
	}

	size = (modifiers: Modifier[]) => {
		if (modifiers.length) return { width: 1600, height: 900 };
		return { width: 800, height: 600 };
	};

	paddleSize = (modifiers: Modifier[]) => {
		const hasBig = modifiers.some(
			(m) => m.dataValues.code === 'big_paddle',
		);
		const hasSmal = modifiers.some(
			(m) => m.dataValues.code === 'small_paddle',
		);
		if (hasBig && hasSmal) return DEFAULT_PADDLE_SIZE;
		if (hasBig) {
			return DEFAULT_BIGGER_PADDLE_SIZE;
		}
		if (hasSmal) return DEFAULT_SMALLER_PADDLE_SIZE;
		return DEFAULT_PADDLE_SIZE;
	};

	spawnPowerUp = (game: GameData) => {
		const potentialPowerUpsEffects = [
			{
				name: 'Enlarge Your Paddle',
				effect: (ball: Ball, game: GameData) => {
					game.players[ball.lastUser].paddle.size.h = Math.min(
						MAX_PADDLE_SIZE * game.height,
						game.players[ball.lastUser].paddle.size.h * 1.2,
					);
				},
				color: '#4C823C',
			},
			{
				name: 'Enlarge Their Paddle',
				effect: (ball: Ball, game: GameData) => {
					game.players[1 - ball.lastUser].paddle.size.h = Math.min(
						MAX_PADDLE_SIZE * game.height,
						game.players[1 - ball.lastUser].paddle.size.h * 1.2,
					);
				},
				color: '#8C1B1B',
			},
			{
				name: 'Shrink Your Paddle',
				effect: (ball: Ball, game: GameData) => {
					game.players[ball.lastUser].paddle.size.h = Math.max(
						MIN_PADDLE_SIZE * game.height,
						game.players[ball.lastUser].paddle.size.h / 1.2,
					);
				},
				color: '#8C1B1B',
			},
			{
				name: 'Shrink Their Paddle',
				effect: (ball: Ball, game: GameData) => {
					game.players[1 - ball.lastUser].paddle.size.h = Math.max(
						MIN_PADDLE_SIZE * game.height,
						game.players[1 - ball.lastUser].paddle.size.h / 1.2,
					);
				},
				color: '#4C823C',
			},
			{
				name: 'Multi Balls',
				effect: (ball: Ball, game: GameData) => {
					const MAX_NEW_BALL = 4;
					let max = 1 + Math.floor(Math.random() * MAX_NEW_BALL);
					for (let i = 0; i < max; i++) {
						let theta =
							(Math.random() * Math.PI * 4) / 6 -
							(2 * Math.PI) / 6;
						if (Math.random() > 0.5) theta = Math.PI - theta;

						const velocitydx = Math.sqrt(
							ball.velocity.dx ** 2 + ball.velocity.dy ** 2,
						);
						const velocitydy = 0;

						game.balls.push({
							position: {
								x: ball.position.x,
								y: ball.position.y,
							},
							velocity: {
								dx:
									Math.cos(theta) * velocitydx -
									Math.sin(theta) * velocitydy,
								dy:
									Math.cos(theta) * velocitydy +
									Math.sin(theta) * velocitydx,
							},
							size: { radius: BALL_RADIUS },
							lastUser: ball.lastUser,
							color: 'white',
						});
					}
				},
				color: '#429dbd',
			},
		];

		if (Math.random() < 0.2) {
			const spawnPoint =
				game.powerUpSpawnPoints[
					Math.floor(Math.random() * game.powerUpSpawnPoints.length)
				];
			if (game.powerUps.some((p) => p.position === spawnPoint)) return;
			const effect =
				potentialPowerUpsEffects[
					Math.floor(Math.random() * potentialPowerUpsEffects.length)
				];
			game.powerUps.push({
				position: spawnPoint,
				size: { radius: POWERUP_RADIUS },
				effect: effect.effect,
				name: effect.name,
				color: effect.color,
			});
		}
	};

	paddleEffect = (player: number) => (modifiers: Modifier[]) => {
		let ret = [];
		if (modifiers.some((m) => m.dataValues.code === 'accelerating_ball'))
			ret.push((ball: Ball, game: GameData) => {
				ball.velocity.dx = Math.min(
					MAX_BALL_SPEED,
					ball.velocity.dx + 0.15 * Math.sign(ball.velocity.dx),
				);
			});
		if (modifiers.some((m) => m.dataValues.code === 'power_up'))
			ret.push((ball: Ball, game: GameData) => {
				this.spawnPowerUp(game);
			});
		return ret;
	};

	obstacles = (modifiers: Modifier[]): Obstacle[] => {
		if (modifiers.some((m) => m.dataValues.code === 'map_1'))
			return [
				{
					shape: 'rectangle',
					position: { x: 0, y: 0 },
					size: { w: 300, h: 300 },
					effect: (game: GameData) => {},
					color: 'white',
				},
			];
		else if (modifiers.some((m) => m.dataValues.code === 'map_2'))
			return [
				{
					shape: 'rectangle',
					position: { x: -350, y: 0 },
					size: { w: 500, h: 75 },
					effect: (game: GameData) => {},
					color: 'white',
				},
				{
					shape: 'rectangle',
					position: { x: 350, y: 0 },
					size: { w: 500, h: 75 },
					effect: (game: GameData) => {},
					color: 'white',
				},
			];
		else if (modifiers.some((m) => m.dataValues.code === 'map_3'))
			return [
				{
					shape: 'rectangle',
					position: { x: -300, y: 300 },
					size: { w: 100, h: 300 },
					effect: (game: GameData) => {},
					color: 'white',
				},
				{
					shape: 'rectangle',
					position: { x: 300, y: -300 },
					size: { w: 100, h: 300 },
					effect: (game: GameData) => {},
					color: 'white',
				},
			];
		return [];
	};

	newGame(
		gameId: string,
		player1: string,
		player2: string,
		modifiers: Modifier[],
	): GameData {
		const { width, height } = this.size(modifiers);
		return {
			gameId: gameId,
			players: [
				{
					login: player1,
					score: 0,
					paddle: {
						position: { x: -width / 2 + 10, y: 0 },
						size: { w: 10, h: this.paddleSize(modifiers) * height },
						velocity: { dx: 0, dy: 0 },
						effect: this.paddleEffect(0)(modifiers),
						color: 'white',
					},
					inputs: [],
					lastInput: Date.now(),
				},
				{
					login: player2,
					score: 0,
					paddle: {
						position: { x: width / 2 - 10, y: 0 },
						size: { w: 10, h: this.paddleSize(modifiers) * height },
						velocity: { dx: 0, dy: 0 },
						effect: this.paddleEffect(1)(modifiers),
						color: 'white',
					},
					inputs: [],
					lastInput: Date.now(),
				},
			],
			balls: [
				{
					position: { x: 0, y: 0 },
					velocity: { dx: 0, dy: 0 },
					size: { radius: BALL_RADIUS },
					lastUser: null,
					color: 'white',
				},
			],
			powerUps: [],
			obstacles: this.obstacles(modifiers),
			width: width,
			height: height,
			lastTimestamp: Date.now(),
			playerToStart: 0,
			isTurnStarted: false,
			turn: 0,
			nbBounces: 0,
			status: {
				ended: false,
				winner: null,
				gonePlayer: null,
			},
			loop: null,
			modifiers: modifiers,
			powerUpSpawnPoints: [
				{ x: 550, y: 350 },
				{ x: 550, y: -350 },
				{ x: -550, y: 350 },
				{ x: -550, y: -350 },

				{ x: 425, y: 0 },
				{ x: 425, y: 275 },
				{ x: 425, y: -275 },
				{ x: -425, y: 0 },
				{ x: -425, y: 275 },
				{ x: -425, y: -275 },

				{ x: 300, y: 200 },
				{ x: 300, y: -200 },
				{ x: -300, y: 200 },
				{ x: -300, y: -200 },

				{ x: 128, y: 304 },
				{ x: 128, y: -304 },
				{ x: -128, y: 304 },
				{ x: -128, y: -304 },

				{ x: 0, y: 342 },
				{ x: 0, y: 128 },
				{ x: 0, y: 0 },
				{ x: 0, y: -128 },
				{ x: 0, y: -342 },
			],
			powerUpName: '',
			powerUpColor: '',
			powerUpDisplayDuration: 0,
			screenShake: 0,
		};
	}

	//#endregion

	//#region GAME COLLISIONS HANDLING

	ballObstaclesCollision(ball: Ball, obstacles: Obstacle[], game: GameData) {
		obstacles.forEach((obstacle) => {
			if (obstacle.shape === 'rectangle') {
				const distBallobstacleX =
					ball.position.x -
					Math.max(
						obstacle.position.x - obstacle.size.w / 2,
						Math.min(
							ball.position.x,
							obstacle.position.x + obstacle.size.w / 2,
						),
					);
				const distBallobstacleY =
					ball.position.y -
					Math.max(
						obstacle.position.y - obstacle.size.h / 2,
						Math.min(
							ball.position.y,
							obstacle.position.y + obstacle.size.h / 2,
						),
					);
				const distanceBallobstacleSquared =
					distBallobstacleX ** 2 + distBallobstacleY ** 2;
				const isBallInobstacle =
					distanceBallobstacleSquared < ball.size.radius ** 2;
				if (!isBallInobstacle) return;
				if (
					ball.position.x >=
						obstacle.position.x - obstacle.size.w / 2 &&
					ball.position.x <=
						obstacle.position.x + obstacle.size.w / 2 &&
					obstacle.size.w / 2 -
						Math.abs(obstacle.position.x - ball.position.x) >=
						obstacle.size.h / 2 -
							Math.abs(obstacle.position.y - ball.position.y)
				) {
					ball.velocity.dy =
						Math.abs(ball.velocity.dy) *
						Math.sign(ball.position.y - obstacle.position.y);
				}
				if (
					ball.position.y >=
						obstacle.position.y - obstacle.size.h / 2 &&
					ball.position.y <=
						obstacle.position.y + obstacle.size.h / 2 &&
					obstacle.size.w / 2 -
						Math.abs(obstacle.position.x - ball.position.x) <
						obstacle.size.h / 2 -
							Math.abs(obstacle.position.y - ball.position.y)
				) {
					ball.velocity.dx =
						Math.abs(ball.velocity.dx) *
						Math.sign(ball.position.x - obstacle.position.x);
				}
			}
		});
	}

	ballWallCollision(ball: Ball, game: GameData, modifiers: Modifier[]) {
		//get all values in shorter variables
		const ballY = ball.position.y;
		const signOfY = Math.sign(ballY);
		const ballX = ball.position.x;
		const ballRadius = ball.size.radius;

		//check if ball is in goal
		const ballIsInGoal = Math.abs(ballX) > game.width / 2;
		if (ballIsInGoal) {
			return this.score(ballX > 0 ? 0 : 1, modifiers)(game);
		}

		if (signOfY == 0) return;

		//check if ball is in wall
		const ballIsInWall =
			Math.abs(ballY + ballRadius * signOfY) > Math.abs(game.height / 2);
		if (!ballIsInWall) return;

		//	calculate new ball position and velocity
		// The ball go in direction of x=0
		const newBallDy = -Math.abs(ball.velocity.dy) * signOfY;
		// The ball is placed tangent to the wall
		const newBallY = (game.height / 2 - ballRadius) * signOfY;
		const newBallX =
			ballX +
			(ball.velocity.dx / ball.velocity.dy) *
				(signOfY * (game.height / 2 - ballRadius) - ballY);

		//apply new ball position and velocity
		ball.velocity.dy = newBallDy;
		ball.position.y = newBallY;
		ball.position.x = newBallX;
		return false;
	}

	ballPaddlesCollision(
		ball: Ball,
		paddles: Player['paddle'][],
		game: GameData,
	) {
		paddles.forEach((paddle, i) => {
			const paddleSign = Math.sign(paddle.position.x);
			const ballSign = Math.sign(ball.position.x);

			if (paddleSign !== ballSign) return;

			const ballX = Math.abs(ball.position.x);
			const pBallX = Math.abs(ball.position.px || ball.position.x);
			if (ballX <= pBallX) return; // The ball is not moving towards the paddle
			const paddleX = Math.abs(paddle.position.x);

			if (ballX < paddleX - ball.size.radius / 2 - paddle.size.w / 2)
				return; // The ball is not in the paddle's area

			if (pBallX >= paddleX - ball.size.radius / 2 - paddle.size.w / 2)
				return; // The ball was already in the paddle's area

			const ballY =
				ball.position.y +
				(ball.velocity.dy *
					(paddle.position.x +
						(paddle.size.w / 2 + ball.size.radius / 2 + 1) *
							Math.sign(ball.velocity.dx) -
						ball.position.x)) /
					ball.velocity.dx;
			const paddleY = paddle.position.y;
			const isBallInPaddle =
				Math.abs(ballY - paddleY) <
				paddle.size.h / 2 + ball.size.radius;

			if (!isBallInPaddle) return;
			ball.velocity.dx = (1 - 2 * i) * Math.abs(ball.velocity.dx);
			ball.position.y - ballY;
			ball.position.x =
				paddle.position.x +
				(paddle.size.w / 2 + ball.size.radius / 2) *
					Math.sign(ball.velocity.dx);
			ball.velocity.dy =
				(ball.position.y - paddle.position.y) / (paddle.size.h / 2);
			game.nbBounces++;
			paddle.effect.forEach((f) => {
				f(ball, game);
				ball.lastUser = i;
			});
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
				if (ball.lastUser === null) return;
				powerUp.effect(ball, game);
				game.powerUps = game.powerUps.filter((p) => p !== powerUp);
				game.powerUpColor = powerUp.color;
				game.powerUpName = powerUp.name;
				game.powerUpDisplayDuration = 3000;
				game.screenShake = 500;
			}
		});
	}

	checkCollisions(game: GameData, modifiers: Modifier[]) {
		game.balls.forEach((ball) => {
			this.ballPaddlesCollision(
				ball,
				game.players.map((p) => p.paddle),
				game,
			);
			if (this.ballWallCollision(ball, game, modifiers)) return;
			this.ballObstaclesCollision(ball, game.obstacles, game);
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
		let game = this.game[gameId] as GameData;
		this.resetBall(game);
		this.resetPaddles(game, modifiers);

		game.loop = setInterval(() => {
			//update dt
			let now = Date.now();
			let dt = now - game.lastTimestamp; // approx 16ms
			game.lastTimestamp = now;

			if (game.players[0].lastInput + 1000 * 30 < now) {
				this.abortGame(game, 0);
			}
			if (game.players[1].lastInput + 1000 * 30 < now) {
				this.abortGame(game, 1);
			}

			if (game.screenShake > 0) game.screenShake -= dt;
			else game.screenShake = 0;

			if (game.powerUpDisplayDuration > 0)
				game.powerUpDisplayDuration -= dt;
			else {
				game.powerUpDisplayDuration = 0;
				game.powerUpName = '';
				game.powerUpColor = '';
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
				this.checkCollisions(game, modifiers);
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

	score(player: number, modifiers: Modifier[]) {
		return (game: GameData) => {
			game.screenShake = 0;
			game.powerUpDisplayDuration = 0;
			game.powerUpName = '';
			game.powerUpColor = '';
			let nBalls = game.balls.filter((b) =>
				game.players[1 - player].paddle.position.x > 0
					? b.position.x < game.width / 2
					: b.position.x > -game.width / 2,
			);
			game.players[player].score += game.balls.length - nBalls.length;
			if (nBalls.length === 0) {
				game.isTurnStarted = false;
				game.nbBounces = 0;
				game.playerToStart = 1 - player;
				game.turn++;
				this.resetBall(game);
				this.resetPaddlesSize(game, modifiers);
				return true;
			} else {
				game.balls = nBalls;
				return false;
			}
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

		if (payload.isRanked) {
			let game = await this.gameService.findWaiting(true);
			if (game) return game.id;
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
		this.server.emit('gameUpdate', { invitee: '*' });
		return game.id;
	}

	@SubscribeMessage('invitePlayer')
	async invitePlayer(client: Socket, payload: any): Promise<string> {
		let user = await this.userService.verify(payload.auth);
		let invitee = await this.userService.findByLogin(payload.invitee);

		if (!user || !invitee) return;
		if (user.dataValues.login === invitee.dataValues.login) return;

		let block = await this.blockService.findBlockByBothLogin(
			user.dataValues.login,
			invitee.dataValues.login,
		);
		if (block) return;
		block = await this.blockService.findBlockByBothLogin(
			invitee.dataValues.login,
			user.dataValues.login,
		);
		if (block) return;
		let games = await this.userGameService.findNotFinishedByLogin(
			user.login,
		);

		if (games.length > 0) {
			return games[0].dataValues.game.id;
		}

		// Create a new game for the player
		let game = await this.gameService.create({
			isRanked: false,
			status: 'invitation',
			invitee: invitee.dataValues.login,
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
		this.server.emit('gameUpdate', { invitee: invitee.dataValues.login });
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
		if (!game) return { action: 'error', message: 'game not recognised' };

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

		if (
			game.dataValues.status === 'waiting' ||
			game.dataValues.status === 'invitation'
		) {
			this.gameService.delete(game.id);
			this.server.emit('gameUpdate', { invitee: '*' });
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
			.filter(
				(g) =>
					g.dataValues.game.status === 'waiting' ||
					g.dataValues.game.status === 'invitation',
			)
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
