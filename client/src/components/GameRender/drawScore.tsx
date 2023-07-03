import p5Types from "p5";

export default function drawScore(
	p5: p5Types,
	score: { player: number; advers: number }
) {
	p5.push();
	p5.textSize(32);
	p5.fill(255);
	p5.text(score.player, -p5.width / 4, -p5.height / 2 + 50);
	p5.text(score.advers, p5.width / 4, -p5.height / 2 + 50);
	p5.pop();
}
