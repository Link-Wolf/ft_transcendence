import p5Types from "p5";

export default function displayTurnText(p5: p5Types, game: any, scale: number) {
	p5.push();
	p5.textSize(32 * scale);
	p5.textAlign(p5.CENTER, p5.CENTER);
	p5.fill(255);

	if (game.isOver) {
		p5.text("Game Over", 0, 0);
		let winner = game.players[0].score > game.players[1].score ? 0 : 1;
		if (winner === game.myIndex) p5.text("You won!", 0, 50 * scale);
		else p5.text("You lost!", 0, 50 * scale);
	} else if (!game.isTurnStarted) {
		if (game.myIndex === game.playerToStart) p5.text("Your turn", 0, 0);
		else p5.text("Opponent's turn", 0, 0);
	}

	p5.pop();
}
