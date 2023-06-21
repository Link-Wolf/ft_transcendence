import Matter from "matter-js";
import { useEffect } from "react";

const Game = () => {
	const HEIGHT = 600;
	const WIDTH = 800;
	const PADDLE_HEIGHT = 30;
	const PADDLE_WIDTH = 8;
	const BALL_SIZE = 8;
	const PADDLE_DISTANCE_FROM_EDGE = 121;
	const BALL_STARTING_Y_VELOCITY = 6;
	// module aliases
	useEffect(() => {
		var Engine = Matter.Engine,
			Render = Matter.Render,
			Runner = Matter.Runner,
			Bodies = Matter.Bodies,
			Composite = Matter.Composite,
			Events = Matter.Events;

		let ballVelocity = {
			x: 3,
			y: BALL_STARTING_Y_VELOCITY,
		};
		let ballPosition = {
			x: WIDTH / 2 - BALL_SIZE / 2,
			y: 0,
		};
		let playerBatPosition = (PADDLE_HEIGHT + HEIGHT) / 2;
		let adversBatPosition = (PADDLE_HEIGHT + HEIGHT) / 2;

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
			PADDLE_HEIGHT
		);
		var adversBat = Bodies.rectangle(
			WIDTH - PADDLE_DISTANCE_FROM_EDGE - PADDLE_WIDTH,
			adversBatPosition,
			PADDLE_WIDTH,
			PADDLE_HEIGHT
		);
		var ball = Bodies.rectangle(
			ballPosition.x,
			ballPosition.y,
			BALL_SIZE,
			BALL_SIZE,
			{
				friction: 0,
				frictionAir: 0,
			}
		);
		Matter.Body.setVelocity(ball, ballVelocity);
		// var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
		// var ceiling = Bodies.rectangle(400, 0, 810, 60, { isStatic: true });
		// var leftWall = Bodies.rectangle(0, 300, 60, 610, { isStatic: true });
		// var rightWall = Bodies.rectangle(800, 300, 60, 610, { isStatic: true });

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
		};
	}, []);

	return <></>;
};

export default Game;
