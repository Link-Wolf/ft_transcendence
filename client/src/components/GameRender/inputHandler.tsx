import Movable from "./Movable";
import p5Types from "p5";

export default function inputHandler(
	p5: p5Types,
	values: any,
	paddles: Movable[],
	keys: Set<number>,
	me: boolean
) {
	if (values.isPointStarted) {
		{
			let dir = 0;
			if (keys.has(p5.UP_ARROW) || keys.has("W".charCodeAt(0))) dir -= 1;
			if (keys.has(p5.DOWN_ARROW) || keys.has("S".charCodeAt(0)))
				dir += 1;
			for (let paddle of paddles) {
				paddle.velocity.dy = dir * values.PADDLE_SPEED;
			}
		}
	} else {
		if (
			values.doPlayerServe == me &&
			keys.has(" ".charCodeAt(0)) &&
			!values.isPointStarted &&
			!values.isGameOver
		) {
			values.isPointStarted = true;
		}
	}
}
