import Matter from "matter-js";
import { useEffect } from "react";

const Game = () => {
	const HEIGHT = 600;
	const WIDTH = 800;
	const PADDLE_HEIGHT = 30;
	const PADDLE_WIDTH = 8;
	const BALL_SIZE = 8;
	const PADDLE_DISTANCE_FROM_EDGE = 121;
	const BALL_DISTANCE_FROM_EDGE = 60;
	const BALL_STARTING_Y_VELOCITY = 6;
	const BALL_STARTING_X_VELOCITY = 3;
	const PADDLE_SPEED = 14;
	// module aliases
	useEffect(() => {
		var Engine = Matter.Engine,
			Render = Matter.Render,
			Runner = Matter.Runner,
			Bodies = Matter.Bodies,
			Composite = Matter.Composite,
			Events = Matter.Events,
			Body = Matter.Body;

		let ballVelocity = {
			x: -BALL_STARTING_X_VELOCITY,
			y: -BALL_STARTING_Y_VELOCITY,
		};
		let ballPosition = {
			x: WIDTH / 2,
			y: BALL_DISTANCE_FROM_EDGE,
		};
		let playerBatPosition = HEIGHT / 2;
		let adversBatPosition = HEIGHT / 2;
		let ballStartsFromTop = true;
		let playerToStart = true;
		let isRoundStarted = false;
		let playerScore = 1;
		let adversScore = 2;

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
		seven segment display (the interesctions are in both segments)
		7  0000
		7  5  1
		7  5  1
		7  6666
		7  4  2
		7  4  2
		7  4  2
		7  3333
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
		) => {};

		const handlePlayerMovement = () => {
			if (keysDown.has("ArrowUp") || keysDown.has("KeyW")) {
				playerBatPosition -= PADDLE_SPEED;
				if (playerBatPosition < PADDLE_HEIGHT / 2) {
					playerBatPosition = PADDLE_HEIGHT / 2;
				}
			}
			if (keysDown.has("ArrowDown") || keysDown.has("KeyS")) {
				playerBatPosition += PADDLE_SPEED;
				if (playerBatPosition > HEIGHT - PADDLE_HEIGHT / 2)
					playerBatPosition = HEIGHT - PADDLE_HEIGHT / 2;
			}
			Body.setPosition(playerBat, {
				x: PADDLE_DISTANCE_FROM_EDGE,
				y: playerBatPosition,
			});
		};

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
			displayScore(playerScore, PlayerScoreDisplay);
			displayScore(adversScore, AdversScoreDisplay);
		};

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
		Composite.add(engine.world, [
			playerBat,
			adversBat,
			ball,
			// ground,
			// ceiling,
			// leftWall,
			// rightWall,
		]);

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
		};
	}, []);

	return <></>;
};

export default Game;
