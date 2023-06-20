import Matter from "matter-js";
import { useEffect } from "react";

const Game = () => {
	// module aliases
	useEffect(() => {
		var Engine = Matter.Engine,
			Render = Matter.Render,
			Runner = Matter.Runner,
			Bodies = Matter.Bodies,
			Composite = Matter.Composite;

		// create an engine
		var engine = Engine.create();

		// create a renderer
		var render = Render.create({
			element: document.body,
			engine: engine,
		});

		var mouse = Matter.Mouse.create(render.canvas),
			mouseConstraint = Matter.MouseConstraint.create(engine, {
				mouse: mouse,
				constraint: {
					stiffness: 0.2,
					render: {
						visible: false,
					},
				},
			});
		render.mouse = mouse;

		// create two boxes and a ground
		var playerBat = Bodies.rectangle(400, 200, 25, 200, {
			isStatic: true,
		});
		var adversBat = Bodies.rectangle(450, 50, 25, 200, {
			isStatic: true,
		});
		var ball = Bodies.circle(450, 50, 20, {
			isStatic: true,
		});
		var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
		var ceiling = Bodies.rectangle(400, 0, 810, 60, { isStatic: true });
		var leftWall = Bodies.rectangle(0, 300, 60, 610, { isStatic: true });
		var rightWall = Bodies.rectangle(800, 300, 60, 610, { isStatic: true });

		// add all of the bodies to the world
		Composite.add(engine.world, [
			playerBat,
			adversBat,
			ball,
			ground,
			ceiling,
			leftWall,
			rightWall,
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
