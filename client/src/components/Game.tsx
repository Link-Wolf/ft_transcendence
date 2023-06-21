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
			x: BALL_STARTING_X_VELOCITY,
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
					fillStyle: "white",
				},
				isSensor: false,
			});
			Composite.add(engine.world, middleLine);
		}

		const keysDown = new Set();
		const addKey = (event: KeyboardEvent) => {
			keysDown.add(event.code);
		};
		const removeKey = (event: KeyboardEvent) => {
			keysDown.delete(event.code);
		};
		document.addEventListener("keydown", addKey);
		document.addEventListener("keyup", removeKey);

		Events.on(engine, "beforeUpdate", function (event) {
			// Player movement
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
			if (keysDown.has("Space")) {
				isRoundStarted = true;
			}
			Body.setPosition(playerBat, {
				x: PADDLE_DISTANCE_FROM_EDGE,
				y: playerBatPosition,
			});
			if (!isRoundStarted) {
				Body.setVelocity(ball, { x: 0, y: 0 });
				Body.setPosition(playerBat, {
					x: PADDLE_DISTANCE_FROM_EDGE,
					y: playerBatPosition,
				});
				Body.setPosition(adversBat, {
					x: WIDTH - PADDLE_DISTANCE_FROM_EDGE - PADDLE_WIDTH,
					y: adversBatPosition,
				});
				return;
			}
			// Bouncing off the ceiling and floor
			if (ball.position.y > HEIGHT - BALL_SIZE) {
				ballVelocity.y = Math.abs(ballVelocity.y) * -1;
			}
			if (ball.position.y < 0) {
				ballVelocity.y = Math.abs(ballVelocity.y);
			}
			Body.setVelocity(ball, ballVelocity);

			// New round if ball goes off the edge
			if (
				ball.position.x > WIDTH - PADDLE_DISTANCE_FROM_EDGE / 2 ||
				ball.position.x < PADDLE_DISTANCE_FROM_EDGE / 2
			) {
				isRoundStarted = false;
				ballStartsFromTop = !ballStartsFromTop;
				ballPosition.x = WIDTH / 2;
				ballPosition.y = ballStartsFromTop
					? BALL_DISTANCE_FROM_EDGE
					: HEIGHT - BALL_DISTANCE_FROM_EDGE;
				ballVelocity.y = ballStartsFromTop
					? -BALL_STARTING_Y_VELOCITY
					: BALL_STARTING_Y_VELOCITY;

				playerToStart = ball.position.x > WIDTH / 2;
				ballVelocity.x = playerToStart
					? BALL_STARTING_X_VELOCITY
					: -BALL_STARTING_X_VELOCITY;
				Body.setPosition(ball, ballPosition);
				Body.setVelocity(ball, { x: 0, y: 0 });
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
