import p5Types from "p5";

export const drawPowerUpsName = (p5: p5Types, game: any) => {
	if (game.powerUpDisplayDuration === 0) return;
	p5.push();

	p5.rotate(((p5.frameCount % 40) - 20) * (Math.PI / 180));
	p5.textSize(Math.max(3000 - game.powerUpDisplayDuration / 10, 40) / 100);
	p5.textAlign(p5.CENTER, p5.CENTER);
	const color = p5.color(game.powerUpColor);
	color.setAlpha(3000 - game.powerUpDisplayDuration / 10);
	p5.fill(color);
	p5.stroke(0, 0, 0, 3000 - game.powerUpDisplayDuration / 10);
	p5.strokeWeight(2);

	p5.text(game.powerUpName, 0, 0);

	p5.pop();
};
