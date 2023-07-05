import Sketch from "react-p5";
import p5Types from "p5";

import Movable from "./Movable";
import paddleBounce from "./paddleBounce";
import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import physic from "./physic";
import drawScore from "./drawScore";

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
	BALL_X_SPEED: 3, //Speed of the ball when moving horizontally
	BALL_STARTING_ANGLE: Math.PI / 4, //Angle of the ball when it is served
	PADDLE_SPEED: 14, //Speed of the paddle when moving,
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
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		playerPaddles.push(
			new Movable(
				{ w: values.PADDLE_WIDTH, h: values.PADDLE_HEIGHT },
				{ x: -values.PADDLE_DISTANCE_FROM_CENTER, y: 0 },
				{ dx: 0, dy: 0 },
				0,
				paddleBounce
			)
		);
		adversPaddles.push(
			new Movable(
				{ w: values.PADDLE_WIDTH, h: values.PADDLE_HEIGHT },
				{ x: values.PADDLE_DISTANCE_FROM_CENTER, y: 0 },
				{ dx: 0, dy: 0 },
				Math.PI,
				paddleBounce
			)
		);
		balls.push(
			new Movable(
				{ w: values.BALL_SIZE, h: values.BALL_SIZE },
				{ x: 0, y: 0 },
				{ dx: 0, dy: 1 },
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

		drawMiddleLine(p5);
		drawScore(p5, score);
		drawMovables(p5, [
			...playerPaddles,
			...adversPaddles,
			...balls,
			...modifierMovables,
		]);
	};

	return <Sketch setup={setup} draw={draw} />;
};

export default GameRender;
