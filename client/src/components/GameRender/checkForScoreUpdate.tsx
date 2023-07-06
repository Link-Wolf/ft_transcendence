import Movable from "./Movable";
import p5Types from "p5";
import resetBalls from "./resetBalls";

export default function checkForScoreUpdate(
	p5: p5Types,
	values: any,
	balls: Movable[],
	score: { player: number; advers: number }
) {
	for (let ball of balls) {
		if (
			ball.position.x <
			-values.PADDLE_DISTANCE_FROM_CENTER -
				values.PADDLE_WIDTH -
				ball.size.w
		) {
			if (balls.length > 1) delete balls[balls.indexOf(ball)];
			else {
				resetBalls(p5, values, balls);
				values.doPlayerServe = true;
				values.isPointStarted = false;
			}
			score.advers++;
			//TODO: tell daddy we got scored and whos turn it is, turn number,
		}
		if (
			ball.position.x >
			values.PADDLE_DISTANCE_FROM_CENTER +
				values.PADDLE_WIDTH +
				ball.size.w
		) {
			if (balls.length > 1) delete balls[balls.indexOf(ball)];
			else {
				resetBalls(p5, values, balls);
				values.doPlayerServe = false;
				values.isPointStarted = false;
			}
			score.player++;
		}
	}
	//TODO: move elsewhere
	//score.moi =...
	//score.lui =...
	// values.isPointStarted = false;
	// values.isGameOver = true;
}
