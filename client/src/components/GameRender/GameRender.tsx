import Sketch from "react-p5";
import p5Types from "p5";

type movable = {
	position: { x: number; y: number };
	velocity: { x: number; y: number };
	facing: number;
}

let playerPaddle: movable; 
let adversPaddle: movable;
let ball: movable; 
let modifierMovables: movable[] = [];

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

		p5.createCanvas(500, 500).parent(canvasParentRef);
	};

	const draw = (p5: p5Types) => {
		p5.background(0);
		p5.ellipse(x, y, 70, 70);
		x++;
	};

	return (
		<Sketch
			setup={setup}
			draw={draw}
		/>
	);
};

export default GameRender;
