import Movable from "./Movable";

export default function paddleBounce(
	object: Movable,
	ball: Movable,
	values: any
) {
	ball.velocity.dy =
		((ball.position.y - object.position.y) / object.size.h) *
		values.MAX_BALL_SPEED;
	ball.position.x =
		object.position.x +
		Math.sign(Math.cos(object.facing)) *
			(object.size.w / 2 + ball.size.w / 2);
	ball.velocity.dx =
		Math.sign(Math.cos(object.facing)) * Math.abs(ball.velocity.dx);
}
