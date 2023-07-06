import Movable from "./Movable";
import p5Types from "p5";

export default function ResetBalls(p5: p5Types, values: any, balls: Movable[]) {
	for (let ball of balls) {
		if (balls.length > 1) delete balls[balls.indexOf(ball)];
		else {
			values.turn++;
			ball.position = {
				x: 0,
				y:
					(values.turn % 2 ? 1 : -1) *
					values.BALL_STARTING_DISTANCE_FROM_CENTER,
			};
			ball.velocity = {
				dx: (values.doPlayerServe ? -1 : 1) * values.BALL_X_SPEED,
				dy:
					(values.turn % 2 ? 1 : -1) *
					values.BALL_X_SPEED *
					Math.tan(values.BALL_STARTING_ANGLE),
			};
		}
	}
	//TODO: tell daddy we reseted the balls
}
