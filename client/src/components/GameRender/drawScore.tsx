import p5Types from "p5";
import Movable from "./Movable";

/**
 *	seven segment display (X are the interesctions, so both segments)
 *	Each number corresponds to the index of the array
 *	(C is the center block)
 *
 *		7		X	0	0	X
 *		7		5			1
 *		7		5			1
 *		7		C	6	6	X
 *		7		4			2
 *		7		4			2
 *		7		4			2
 *		7		X	3	3	X
 */
const draw7Segment = (p5: p5Types, score: number, position: number) => {
	const i4 = score % 10 & 1;
	const i3 = (score % 10 >> 1) & 1;
	const i2 = (score % 10 >> 2) & 1;
	const i1 = (score % 10 >> 3) & 1;
	const unit_size = 8;

	const fillColors = [p5.color(0, 0, 0, 0), p5.color(255, 255, 255)];
	p5.push();
	p5.translate(position, -p5.width / 4);
	p5.fill(
		fillColors[
			1 &
				((~i1 & i3) |
					(i1 & ~i4) |
					(i2 & i3) |
					~(i2 | i4) |
					(i1 & ~i2 & ~i3) |
					(~i1 & i2 & i4))
		]
	);
	p5.rect(1.5 * unit_size, -3 * unit_size, 4 * unit_size, 1 * unit_size);
	p5.fill(
		fillColors[
			1 &
				(~(i1 | i2) |
					~(i2 | i3) |
					~(i2 | i4) |
					(~i1 & ~(i3 ^ i4)) |
					(i1 & ~i3 & i4))
		]
	);
	p5.rect(3 * unit_size, -1.5 * unit_size, 1 * unit_size, 4 * unit_size);
	p5.fill(fillColors[1 & ((i1 ^ i2) | (~i3 & i4) | (~(i3 ^ i4) & ~i2))]);
	p5.rect(3 * unit_size, 2 * unit_size, 1 * unit_size, 5 * unit_size);
	p5.fill(
		fillColors[
			1 &
				((i1 & ~i3) |
					~(i1 | i2 | i4) |
					(i2 & (i3 ^ i4)) |
					(~i2 & i3 & i4))
		]
	);
	p5.rect(1.5 * unit_size, 4 * unit_size, 4 * unit_size, 1 * unit_size);
	p5.fill(fillColors[1 & (~(i2 | i4) | (i3 & ~i4) | (i1 & i2) | (i1 & i3))]);
	p5.rect(0 * unit_size, 2 * unit_size, 1 * unit_size, 5 * unit_size);
	p5.fill(
		fillColors[
			1 &
				((i1 & ~i2) |
					~(i3 | i4) |
					(~i3 & (i1 ^ i2)) |
					(i1 & i3) |
					(i2 & ~i4))
		]
	);
	p5.rect(0 * unit_size, -1.5 * unit_size, 1 * unit_size, 4 * unit_size);
	p5.fill(
		fillColors[
			1 & ((i3 & (i1 | ~i2 | ~i4)) | (i1 & i4) | (~i3 & (i1 ^ i2)))
		]
	);
	p5.rect(1.5 * unit_size, 0 * unit_size, 4 * unit_size, 1 * unit_size);
	p5.fill(fillColors[score >= 10 ? 1 : 0]);
	p5.rect(-2.5 * unit_size, 0.5 * unit_size, 1 * unit_size, 8 * unit_size);
	p5.pop();
};

export default function drawScore(
	p5: p5Types,
	score: { player: number; advers: number },
	isPlayerLeft: number
) {
	p5.push();
	draw7Segment(p5, score.player, -isPlayerLeft * (p5.width / 2 - 160));
	draw7Segment(p5, score.advers, isPlayerLeft * (p5.width / 2 - 160));
	p5.pop();
}
