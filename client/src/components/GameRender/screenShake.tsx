import p5Types from "p5";

export const screenShake = (p5: p5Types, game: any) => {
	if (game.screenShakeDuration === 0) return;

	p5.translate((p5.frameCount % 40) - 20, 0);
};
