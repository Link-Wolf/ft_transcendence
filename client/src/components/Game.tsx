import Matter from "matter-js";
import { MouseEventHandler, useContext, useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import { UserContext } from "../App";
import axios from "axios";

const Game = () => {
	const context = useContext(UserContext);
	const [hasFoundGame, setHasFoundGame] = useState(false);
	const [gameId, setGameId] = useState(-1);
	const [amFirstPlayer, setAmFirstPlayer] = useState(false);
	const [lookingForMatch, setLookingForMatch] = useState(true);

	useEffect(() => {
		const startGame = (payload: any) => {
			console.log("Useeffect : ", payload);
			setGameId(payload.gameId);
			setAmFirstPlayer(payload.firstPlayer == context.login);
			setHasFoundGame(true);
		};

		socket.emit("joinWaitRoom", {
			auth: Cookies.get("token"),
			isRanked: true, //TODO: add option for ranked mode
		});

		socket.on("startGame", startGame);

		return () => {
			socket.off("startGame", startGame);
		};
	}, []);

	const isLookingForMatch = () => {
		setLookingForMatch(false);
		//TODO: emit + redirect to home
	};

	if (!hasFoundGame)
		return <WaitingForMatch setLookingForMatch={isLookingForMatch} />;
	return (
		<GameRender
			gameId={gameId}
			amFirstPlayer={amFirstPlayer}
		/>
	);
};

const WaitingForMatch = ({
	setLookingForMatch,
}: {
	setLookingForMatch: Function;
}) => {
	return (
		<>
			<div>Recherche en cours . . .</div>
			<div>*inserer animation de recherche*</div>
			<button
				onClick={() => {
					setLookingForMatch();
				}}
			>
				Cancel
			</button>
		</>
	);
};

const GameRender = ({
	gameId,
	amFirstPlayer,
	modifiers,
}: {
	gameId: Number;
	amFirstPlayer: boolean;
	modifiers?: any[];
}) => {
	const context = useContext(UserContext);
	const [opponentLogin, setOpponentLogin] = useState("");

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/game/${gameId}`)
			.then((res) => {
				setOpponentLogin(
					res.data.users[0] === context.login
						? res.data.users[0]
						: res.data.users[1]
				);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	const HEIGHT = 600; //Canvas height
	const WIDTH = 800; //Canvas width
	const PADDLE_HEIGHT = 30; //Paddle height
	const PADDLE_WIDTH = 8; //Paddle width
	const BALL_SIZE = 8; //Ball size
	const PADDLE_DISTANCE_FROM_EDGE = 121; //Distance between paddle and edge of the canvas
	const BALL_DISTANCE_FROM_EDGE = 60; //Distance between ball and edge of the canvas
	const BALL_STARTING_Y_VELOCITY = 6; //Ball vector y at the start of the round
	const BALL_STARTING_X_VELOCITY = 3; //Ball vector x at the start of the round
	const PADDLE_SPEED = 14; //Speed of the paddle when moving

	useEffect(() => {
		var Engine = Matter.Engine,
			Render = Matter.Render,
			Runner = Matter.Runner,
			Bodies = Matter.Bodies,
			Composite = Matter.Composite,
			Events = Matter.Events,
			Body = Matter.Body;

		// The ball global velocity in both axis
		let ballVelocity = {
			x: -BALL_STARTING_X_VELOCITY,
			y: -BALL_STARTING_Y_VELOCITY,
		};

		//The ball position in both axis
		let ballPosition = {
			x: WIDTH / 2,
			y: BALL_DISTANCE_FROM_EDGE,
		};
		let playerBatPosition = HEIGHT / 2; //The player paddle position in y axis (left paddle)
		let adversBatPosition = HEIGHT / 2; //The advers paddle position in y axis (right paddle)
		let ballStartsFromTop = true; //Weather the ball starts from the top or the bottom
		let playerToStart = amFirstPlayer; //Weather the player starts the round or the adversary
		let isRoundStarted = false; //Weather the round has started
		let playerScore = 0; //The player score
		let adversScore = 0; //The adversary score

		// create an engine
		var engine = Engine.create({
			gravity: {
				x: 0,
				y: 0,
			},
		});

		// create a renderer
		var render = Render.create({
			element: document.body,
			engine: engine,
			options: {
				width: WIDTH,
				height: HEIGHT,
				wireframes: false,
			},
		});

		// create two boxes and a ground
		var playerBat = Bodies.rectangle(
			PADDLE_DISTANCE_FROM_EDGE,
			playerBatPosition,
			PADDLE_WIDTH,
			PADDLE_HEIGHT,
			{
				friction: 0,
				frictionAir: 0,
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			}
		);
		var adversBat = Bodies.rectangle(
			WIDTH - PADDLE_DISTANCE_FROM_EDGE - PADDLE_WIDTH,
			adversBatPosition,
			PADDLE_WIDTH,
			PADDLE_HEIGHT,
			{
				friction: 0,
				frictionAir: 0,
				isStatic: true,
				render: {
					fillStyle: "white",
				},
			}
		);
		var ball = Bodies.rectangle(
			ballPosition.x,
			ballPosition.y,
			BALL_SIZE,
			BALL_SIZE,
			{
				friction: 0,
				frictionAir: 0,
				isSensor: false,
				render: {
					fillStyle: "white",
				},
			}
		);
		ball.collisionFilter = {
			group: -1,
			category: 2,
			mask: 0,
		};

		for (let i = 0; i < HEIGHT; i += 20) {
			let middleLine = Bodies.rectangle(WIDTH / 2, i, 2, 10, {
				isStatic: true,
				render: {
					fillStyle: "grey",
				},
				isSensor: false,
			});
			Composite.add(engine.world, middleLine);
		}

		/*
		seven segment display (X are the interesctions, so both segments)
		Each number corresponds to the index of the array

			7		X	0	0	X
			7		5			1
			7		5			1
			7		X	6	6	X
			7		4			2
			7		4			2
			7		4			2
			7		X	3	3	X

		*/
		var UNIT_SIZE = 8;
		var POSITION = 160;
		var options = {
			isStatic: true,
			render: {
				fillStyle: "#0000",
			},
			isSensor: false,
		};
		var distBetween1AndNumbers = 3 * UNIT_SIZE;
		var PlayerScoreDisplay = [
			Bodies.rectangle(
				//TOP BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//TOP LEFT BAR
				POSITION +
					distBetween1AndNumbers +
					3 * UNIT_SIZE +
					(1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//BOTTOM LEFT BAR
				POSITION +
					distBetween1AndNumbers +
					3 * UNIT_SIZE +
					(1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 4 * UNIT_SIZE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				// BOTTOM BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 7 * UNIT_SIZE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//BOTTOM RIGHT BAR
				POSITION + distBetween1AndNumbers + (1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 4 * UNIT_SIZE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//TOP RIGHT BAR
				POSITION + distBetween1AndNumbers + (1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//MIDDLE BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 3 * UNIT_SIZE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//ONE BAR
				POSITION,
				BALL_DISTANCE_FROM_EDGE + (8 * UNIT_SIZE) / 2,
				UNIT_SIZE,
				8 * UNIT_SIZE,
				options
			),
		];
		var UNIT_SIZE = 8;
		var POSITION = WIDTH - 160 - 4 * UNIT_SIZE - 3 * UNIT_SIZE;
		var options = {
			isStatic: true,
			render: {
				fillStyle: "#0000",
			},
			isSensor: false,
		};
		var AdversScoreDisplay = [
			Bodies.rectangle(
				//TOP BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//TOP LEFT BAR
				POSITION +
					distBetween1AndNumbers +
					3 * UNIT_SIZE +
					(1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//BOTTOM LEFT BAR
				POSITION +
					distBetween1AndNumbers +
					3 * UNIT_SIZE +
					(1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 4 * UNIT_SIZE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				// BOTTOM BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 7 * UNIT_SIZE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//BOTTOM RIGHT BAR
				POSITION + distBetween1AndNumbers + (1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 4 * UNIT_SIZE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//TOP RIGHT BAR
				POSITION + distBetween1AndNumbers + (1 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + (4 * UNIT_SIZE) / 2,
				1 * UNIT_SIZE,
				4 * UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//MIDDLE BAR
				POSITION + distBetween1AndNumbers + (4 * UNIT_SIZE) / 2,
				BALL_DISTANCE_FROM_EDGE + 3 * UNIT_SIZE + (1 * UNIT_SIZE) / 2,
				4 * UNIT_SIZE,
				UNIT_SIZE,
				options
			),
			Bodies.rectangle(
				//ONE BAR
				POSITION,
				BALL_DISTANCE_FROM_EDGE + (8 * UNIT_SIZE) / 2,
				UNIT_SIZE,
				8 * UNIT_SIZE,
				options
			),
		];
		Composite.add(engine.world, PlayerScoreDisplay);
		Composite.add(engine.world, AdversScoreDisplay);

		const keysDown = new Set();
		const addKey = (event: KeyboardEvent) => {
			keysDown.add(event.code);
		};
		const removeKey = (event: KeyboardEvent) => {
			keysDown.delete(event.code);
		};
		document.addEventListener("keydown", addKey);
		document.addEventListener("keyup", removeKey);

		const resetBall = () => {
			ballPosition.x = WIDTH / 2;
			ballPosition.y = ballStartsFromTop
				? BALL_DISTANCE_FROM_EDGE
				: HEIGHT - BALL_DISTANCE_FROM_EDGE;
			ballVelocity.y = ballStartsFromTop
				? -BALL_STARTING_Y_VELOCITY
				: BALL_STARTING_Y_VELOCITY;

			ballVelocity.x = playerToStart
				? -BALL_STARTING_X_VELOCITY
				: BALL_STARTING_X_VELOCITY;
			Body.setPosition(ball, ballPosition);
			Body.setVelocity(ball, { x: 0, y: 0 });
		};

		const moveBall = () => {
			if (ball.position.y > HEIGHT - BALL_SIZE) {
				ballVelocity.y = Math.abs(ballVelocity.y) * -1;
			}
			if (ball.position.y < 0) {
				ballVelocity.y = Math.abs(ballVelocity.y);
			}
			Body.setVelocity(ball, ballVelocity);
		};

		const fixAllPositions = () => {
			{
				Body.setVelocity(ball, { x: 0, y: 0 });
				Body.setPosition(playerBat, {
					x: PADDLE_DISTANCE_FROM_EDGE,
					y: playerBatPosition,
				});
				Body.setPosition(adversBat, {
					x: WIDTH - PADDLE_DISTANCE_FROM_EDGE - PADDLE_WIDTH,
					y: adversBatPosition,
				});
			}
		};

		const handlePaddleCollision = (
			paddle: Matter.Body,
			ball: Matter.Body
		) => {
			let bouncingXDirection =
				Math.sign(ball.velocity.x) * -1 * BALL_STARTING_X_VELOCITY;
			if (
				Math.abs(ball.position.x - paddle.position.x) <=
					BALL_SIZE / 2 + PADDLE_WIDTH / 2 &&
				Math.abs(ball.position.y - paddle.position.y) <=
					BALL_SIZE / 2 + PADDLE_HEIGHT / 2
			) {
				ballPosition = {
					x:
						paddle.position.x +
						Math.sign(bouncingXDirection) *
							(BALL_SIZE / 2 + PADDLE_WIDTH / 2),
					y: ball.position.y,
				};
				ballVelocity = {
					x: bouncingXDirection,
					y:
						((ball.position.y - paddle.position.y) /
							PADDLE_HEIGHT) *
						12,
				};
				Body.setVelocity(ball, ballVelocity);
				Body.setPosition(ball, ballPosition);
				if (ball.position.x < WIDTH / 2) {
					socket.volatile.emit("bounceBall", {
						ball: {
							position: ball.position,
							velocity: ball.velocity,
						},
						auth: Cookies.get("token"),
						gameId: gameId,
					});
				}
			}
		};

		socket.on("bounceBall", (data) => {
			ballPosition = data.ball.position;
			ballVelocity = data.ball.velocity;
			Body.setVelocity(ball, ballVelocity);
			Body.setPosition(ball, ballPosition);
		});

		const handlePlayerMovement = () => {
			let hasMoved = false;
			if (keysDown.has("ArrowUp") || keysDown.has("KeyW")) {
				playerBatPosition -= PADDLE_SPEED;
				if (playerBatPosition < PADDLE_HEIGHT / 2) {
					playerBatPosition = PADDLE_HEIGHT / 2;
				}
				hasMoved = true;
			}
			if (keysDown.has("ArrowDown") || keysDown.has("KeyS")) {
				playerBatPosition += PADDLE_SPEED;
				if (playerBatPosition > HEIGHT - PADDLE_HEIGHT / 2)
					playerBatPosition = HEIGHT - PADDLE_HEIGHT / 2;
					hasMoved = true;
			}
			
			if (hasMoved) {
				socket.volatile.emit("movePaddle", {
				gameId: gameId,
				position: playerBatPosition,
				auth: Cookies.get("token"),
			});
			Body.setPosition(playerBat, {
				x: PADDLE_DISTANCE_FROM_EDGE,
				y: playerBatPosition,
			});
			}
		};

		socket.on("movePaddle", (payload: any) => {
			console.log(payload);
			if (payload.player === context.login) return;
			adversBatPosition = payload.position;
		});

		const activateSegment = (segment: Matter.Body) => {
			segment.render.fillStyle = "#EEE";
		};

		const deactivateSegment = (segment: Matter.Body) => {
			segment.render.fillStyle = "#0000";
		};

		const toggleDisplay = (segment: Matter.Body, isOn: number) => {
			if (isOn) {
				activateSegment(segment);
			} else {
				deactivateSegment(segment);
			}
		};

		const displayScore = (score: number, display: Matter.Body[]) => {
			const i4 = score % 10 & 1;
			const i3 = (score % 10 >> 1) & 1;
			const i2 = (score % 10 >> 2) & 1;
			const i1 = (score % 10 >> 3) & 1;
			toggleDisplay(
				display[0],
				1 &
					((~i1 & i3) |
						(i1 & ~i4) |
						(i2 & i3) |
						~(i2 | i4) |
						(i1 & ~i2 & ~i3) |
						(~i1 & i2 & i4))
			);
			toggleDisplay(
				display[1],
				1 &
					(~(i1 | i2) |
						~(i2 | i3) |
						~(i2 | i4) |
						(~i1 & ~(i3 ^ i4)) |
						(i1 & ~i3 & i4))
			);
			toggleDisplay(
				display[2],
				1 & ((i1 ^ i2) | (~i3 & i4) | (~(i3 ^ i4) & ~i2))
			);
			toggleDisplay(
				display[3],
				1 &
					((i1 & ~i3) |
						~(i1 | i2 | i4) |
						(i2 & (i3 ^ i4)) |
						(~i2 & i3 & i4))
			);
			toggleDisplay(
				display[4],
				1 & (~(i2 | i4) | (i3 & ~i4) | (i1 & i2) | (i1 & i3))
			);
			toggleDisplay(
				display[5],
				1 &
					((i1 & ~i2) |
						~(i3 | i4) |
						(~i3 & (i1 ^ i2)) |
						(i1 & i3) |
						(i2 & ~i4))
			);
			toggleDisplay(
				display[6],
				1 & ((i3 & (i1 | ~i2 | ~i4)) | (i1 & i4) | (~i3 & (i1 ^ i2)))
			);
			toggleDisplay(display[7], Number(score >= 10));
		};
		displayScore(playerScore, PlayerScoreDisplay);
		displayScore(adversScore, AdversScoreDisplay);

		const updateScore = (playerScored: boolean) => {
			if (playerScored) {
				playerScore++;
				playerToStart = false;
			} else {
				adversScore++;
				playerToStart = true;
			}
			isRoundStarted = false;
			ballStartsFromTop = !ballStartsFromTop;
			if (playerScore >= 11 || adversScore >= 11) {
				console.log("Someone has won!");
			}
			socket.volatile.emit("markGoal", {
				gameId: gameId,
				auth: Cookies.get("token"),
				score: [
					{
						login: context.login,
						score: playerScore,
					},
					{
						login: opponentLogin,
						score: adversScore,
					},
				],
				ball: {
					position: ball.position,
				},
				playerToPlay: playerToStart ? context.login : opponentLogin,
			});
			displayScore(playerScore, PlayerScoreDisplay);
			displayScore(adversScore, AdversScoreDisplay);
		};

		socket.on("markGoal", (payload: any) => {
			playerScore = payload.score.find(
				(score: any) => score.login === context.login
			).score;
			adversScore = payload.score.find(
				(score: any) => score.login === opponentLogin
			).score;
			ballPosition = payload.ball.position;
			playerToStart = payload.playerToPlay === context.login;
			Body.setPosition(ball, ballPosition);
			isRoundStarted = false;
		});

		Events.on(engine, "beforeUpdate", function (event) {
			// Player movement
			handlePlayerMovement();
			if (keysDown.has("Space") && !isRoundStarted && playerToStart) {
				isRoundStarted = true;
			}
			if (!isRoundStarted) {
				fixAllPositions();
				return;
			}
			moveBall();
			handlePaddleCollision(playerBat, ball);
			handlePaddleCollision(adversBat, ball);
			if (
				ball.position.x > WIDTH - PADDLE_DISTANCE_FROM_EDGE / 2 ||
				ball.position.x < PADDLE_DISTANCE_FROM_EDGE / 2
			) {
				updateScore(ball.position.x > WIDTH / 2);
				resetBall();
			}
		});

		// add all of the bodies to the world
		Composite.add(engine.world, [playerBat, adversBat, ball]);

		// run the renderer
		Render.run(render);

		// create runner
		var runner = Runner.create();

		// run the engine
		Runner.run(runner, engine);

		return () => {
			Runner.stop(runner);
			Render.stop(render);
			render.canvas.remove();
			document.removeEventListener("keydown", addKey);
			document.removeEventListener("keyup", removeKey);
			socket.off("markGoal");
			socket.off("movePaddle");
			socket.off("bounceBall");
		};
	}, []);

	return <></>;
};

export default Game;
