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

	private game = {
		players: [
			{
				paddle: {
					size: {
						w: 0,
						h: 0,
					},
					position: {
						x: 0,
						y: 0,
					},
					velocity: {
						dx: 0,
						dy: 0,
					},
				},
				score: 0,
				inputs: [],
				login: '',
			},
			{
				paddle: {
					size: {
						w: 0,
						h: 0,
					},
					position: {
						x: 0,
						y: 0,
					},
					velocity: {
						dx: 0,
						dy: 0,
					},
				},
				score: 0,
				inputs: [],
				login: '',
			},
		],
		ball: {
			size: {
				radius: 0,
			},
			position: {
				x: 0,
				y: 0,
			},
			velocity: {
				dx: 0,
				dy: 0,
			},
		},
		turn: 0,
		playerToStart: 0,
		isTurnStarted: false,
		gameId: 0,
		lastTimestamp: 0,
		height: 600,
		width: 800,
	};

	private gameLoop: NodeJS.Timeout | null = null;

	handleInputs() {
		this.game.players.forEach((player) => {
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

	moveBall(dt: number) {
		this.game.ball.position.x += this.game.ball.velocity.dx * dt;
		this.game.ball.position.y += this.game.ball.velocity.dy * dt;
	}

	movePaddles(dt: number) {
		this.game.players.forEach((player) => {
			player.paddle.position.y += player.paddle.velocity.dy * dt;
		});
	}

	resetBall() {
		this.game.ball.position.x = 0;
		this.game.ball.position.y =
			((this.game.height / 2 - 50) * this.game.turn) % 2 == 0 ? 1 : -1;
		this.game.ball.velocity.dx = 1;
		this.game.ball.velocity.dy = 1;
	}

	resetPaddles() {
		this.game.players.forEach((player, i) => {
			player.paddle.position.y = 0;
			player.paddle.velocity.dy = 0;
			player.paddle.position.x = i == 0 ? -350 : 350;
			player.paddle.size.w = 20;
			player.paddle.size.h = 100;
		});
	}

	checkCollisions() {
		//bounce of top
		if (
			this.game.ball.position.y - this.game.ball.size.radius / 2 <
			-this.game.height / 2
		) {
			this.game.ball.velocity.dy = 1;
			this.game.ball.position.y =
				-this.game.height / 2 - this.game.ball.size.radius / 2;
		}
		//bounce of bottom
		if (
			this.game.ball.position.y + this.game.ball.size.radius / 2 >
			this.game.height / 2
		) {
			this.game.ball.velocity.dy = -1;
			this.game.ball.position.y =
				this.game.height / 2 + this.game.ball.size.radius / 2;
		}
		// bounce on paddles
		this.game.players.forEach((player) => {
			let paddle = player.paddle;
			if (
				(this.game.ball.position.x -
					Math.max(
						paddle.position.x - paddle.size.w / 2,
						Math.min(
							this.game.ball.position.x,
							paddle.position.x + paddle.size.w / 2,
						),
					)) **
					2 +
					(this.game.ball.position.y -
						Math.max(
							paddle.position.y - paddle.size.h / 2,
							Math.min(
								this.game.ball.position.y,
								paddle.position.y + paddle.size.h / 2,
							),
						)) **
						2 <
				this.game.ball.size.radius ** 2
			) {
				this.game.ball.velocity.dx *= -1;
				this.game.ball.position.x =
					paddle.position.x +
					(paddle.size.w / 2 + this.game.ball.size.radius / 2) *
						Math.sign(this.game.ball.velocity.dx);
			}
		});
		//score on player 0 goal
		if (this.game.ball.position.x < -this.game.width / 2) {
			this.game.players[1].score++;
			this.resetBall();
			this.resetPaddles();
			this.game.playerToStart = 0;
			this.game.isTurnStarted = false;
		}
		// score on player 1 goal
		if (this.game.ball.position.x < -this.game.width / 2) {
			this.game.players[0].score++;
			this.resetBall();
			this.resetPaddles();
			this.game.playerToStart = 1;
			this.game.isTurnStarted = false;
		}
	}

	handleStartTurn() {
		if (this.game.isTurnStarted) return;
		let inputs = this.game.players[this.game.playerToStart].inputs;
		if (inputs.includes(32)) {
			//SPACE
			this.game.isTurnStarted = true;
			this.game.turn++;
		}
	}

	startGame(gameId: number, player1: string, player2: string) {
		this.game.gameId = gameId;
		this.game.players[0].login = player1;
		this.game.players[1].login = player2;
		this.resetBall();
		this.resetPaddles();
		this.game.lastTimestamp = Date.now();
		this.gameLoop = setInterval(() => {
			//update dt
			let now = Date.now();
			let dt = now - this.game.lastTimestamp;
			this.game.lastTimestamp = now;

			// check for final score
			if (
				this.game.players[0].score >= 11 ||
				this.game.players[1].score >= 11
			) {
				this.stopGame();
				this.server.to(`game-${gameId}`).emit('gameOver', {
					score: [
						this.game.players[0].score,
						this.game.players[1].score,
					],
				});
			}

			// if turn is started, update the game
			if (this.game.isTurnStarted) {
				this.handleInputs();
				this.moveBall(dt);
				this.movePaddles(dt);
				this.checkCollisions();
			} else this.handleStartTurn();
			this.server.to(`game-${gameId}`).emit('gameUpdate', this.game);
		}, 16);
	}

	stopGame() {
		clearInterval(this.gameLoop);
		this.game = {
			gameId: 0,
			width: 0,
			height: 0,
			players: [
				{
					login: '',
					score: 0,
					paddle: {
						position: { x: 0, y: 0 },
						velocity: { dx: 0, dy: 0 },
						size: { w: 0, h: 0 },
					},
					inputs: [],
				},
				{
					login: '',
					score: 0,
					paddle: {
						position: { x: 0, y: 0 },
						velocity: { dx: 0, dy: 0 },
						size: { w: 0, h: 0 },
					},
					inputs: [],
				},
			],
			ball: {
				position: { x: 0, y: 0 },
				size: { radius: 0 },
				velocity: { dx: 0, dy: 0 },
			},
			playerToStart: 0,
			isTurnStarted: false,
			turn: 0,
			lastTimestamp: 0,
		};
	}

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
			});
			this.startGame(waitingGame.id, users[0].login, users[1].login);
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
