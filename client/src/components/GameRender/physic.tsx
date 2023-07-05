import Movable from "./Movable";
import p5Types from "p5";

export default function physic(
	p5: p5Types,
	values: any,
	balls: Movable[],
	movables: Movable[]
) {
	if (values.isPointStarted) {
		for (let movable of movables) {
			movable.move();
		}
		for (let ball of balls) {
			ball.move();
			for (let movable of movables) {
				if (movable.collide(ball))
					movable.onColide(movable, ball, values);
			}
		}
	}
}
