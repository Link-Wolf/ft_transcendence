import socket from "../../socket";
import Movable from "./Movable";

export default function paddleBounce(
	object: Movable,
	ball: Movable,
	values: any
) {
	ball.velocity.dy =
		((ball.position.y - object.position.y) / object.size.h) ** 2 *
		values.MAX_BALL_SPEED;
	ball.position.x =
		object.position.x +
		Math.sign(Math.cos(object.facing)) *
			(object.size.w / 2 + ball.size.w / 2);
	ball.velocity.dx =
		Math.sign(Math.cos(object.facing)) * Math.abs(ball.velocity.dx);
	if (object.facing == 0) {
		console.log("oui");
		socket.emit("paddleBounce", {
			ball: {
				position: ball.position,
				velocity: ball.velocity,
			},
			paddle: {
				position: object.position,
				velocity: object.velocity,
			},
		});
		console.log("non");
	}
}
