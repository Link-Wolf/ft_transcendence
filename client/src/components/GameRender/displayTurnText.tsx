import p5Types from "p5";

export default function displayTurnText(
	p5: p5Types,
	values: any,
	score: { player: number; advers: number }
) {
	p5.push();
	p5.textSize(32);
	p5.textAlign(p5.CENTER, p5.CENTER);
	p5.fill(255);
	if (values.isGameOver) {
		console.log(values);
		p5.text("Game Over", 0, -50);
		p5.text(`${score.player > score.advers ? "You" : "They"} won!`, 0, 0);
	} else if (!values.isPointStarted) {
		if (values.doPlayerServe) {
			p5.text("Your turn", 0, -50);
		} else {
			p5.text("Opponent's turn", 0, -50);
		}
		p5.text("Press space to serve", 0, 0);
	}
	p5.pop();
}
