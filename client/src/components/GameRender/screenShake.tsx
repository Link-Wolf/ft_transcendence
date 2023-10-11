import p5Types from "p5";

export const screenShake = (p5: p5Types, game: any) => {
	if (game.screenShake <= 0) return;

	p5.translate(Math.pow(p5.frameCount % 5, 2) - 12.5, 0);
};
