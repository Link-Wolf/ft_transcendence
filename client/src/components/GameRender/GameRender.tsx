import Sketch from "react-p5";
import p5Types from "p5";

import Movable from "./Movable";
import paddleBounce from "./paddleBounce";
import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import physic from "./physic";
import drawScore from "./drawScore";
import inputHandler from "./inputHandler";
import displayTurnText from "./displayTurnText";

let playerPaddles: Movable[] = [];
let adversPaddles: Movable[] = [];
let balls: Movable[] = [];
let modifierMovables: Movable[] = [];
let score = {
	player: 0,
	advers: 0,
};
let values: any = {
	HEIGHT: 600, //Canvas height
	WIDTH: 800, //Canvas width
	PADDLE_HEIGHT: 30, //Paddle height
	PADDLE_WIDTH: 8, //Paddle width
	BALL_SIZE: 8, //Ball size
	PADDLE_DISTANCE_FROM_CENTER: 280, //Distance between paddle and edge of the canvas
	BALL_STARTING_DISTANCE_FROM_CENTER: 540, //Distance between ball and edge of the canvas
	BALL_X_SPEED: 250, //Speed of the ball when moving horizontally
	BALL_STARTING_ANGLE: Math.PI / 4, //Angle of the ball when it is served
	PADDLE_SPEED: 500, //Speed of the paddle when moving,
	MAX_BALL_SPEED: 2000, //Max speed of the ball
	doPlayerServe: true,
	isPointStarted: false,
};
let playerKeys = new Set<number>();
let adversKeys = new Set<number>();

const GameRender = ({
	gameId,
	amFirstPlayer,
	modifiers,
}: {
	gameId: Number;
	amFirstPlayer: boolean;
	modifiers?: any[];
}) => {
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		playerPaddles.push(
			new Movable(
				p5,
				{ w: values.PADDLE_WIDTH, h: values.PADDLE_HEIGHT },
				{ x: -values.PADDLE_DISTANCE_FROM_CENTER, y: 0 },
				{ dx: 0, dy: 0 },
				0,
				paddleBounce
			)
		);
		adversPaddles.push(
			new Movable(
				p5,
				{ w: values.PADDLE_WIDTH, h: values.PADDLE_HEIGHT },
				{ x: values.PADDLE_DISTANCE_FROM_CENTER, y: 0 },
				{ dx: 0, dy: 0 },
				Math.PI,
				paddleBounce
			)
		);
		balls.push(
			new Movable(
				p5,
				{ w: values.BALL_SIZE, h: values.BALL_SIZE },
				{ x: 0, y: 0 },
				{
					dx: values.BALL_X_SPEED,
					dy:
						values.BALL_X_SPEED *
						Math.tan(values.BALL_STARTING_ANGLE),
				},
				0,
				paddleBounce
			)
		);
		p5.createCanvas(values.WIDTH, values.HEIGHT).parent(canvasParentRef);
		p5.rectMode(p5.CENTER);
		p5.angleMode(p5.RADIANS);
		p5.frameRate(60);
		p5.noStroke();
	};

	const draw = (p5: p5Types) => {
		p5.background(0);
		p5.translate(p5.width / 2, p5.height / 2);

		physic(p5, values, balls, [
			...playerPaddles,
			...adversPaddles,
			...modifierMovables,
		]);

		inputHandler(p5, values, playerPaddles, playerKeys);
		inputHandler(p5, values, adversPaddles, adversKeys);

		drawMiddleLine(p5);
		drawScore(p5, score);
		drawMovables(p5, [
			...playerPaddles,
			...adversPaddles,
			...balls,
			...modifierMovables,
		]);
		displayTurnText(p5, values);
	};

	return (
		<Sketch
			setup={setup}
			draw={draw}
			keyPressed={(p5) => {
				playerKeys.add(p5.keyCode);
			}}
			keyReleased={(p5) => {
				playerKeys.delete(p5.keyCode);
			}}
		/>
	);
};

export default GameRender;
