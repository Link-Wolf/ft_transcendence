import p5Types from "p5";

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
const draw7Segment = (
	p5: p5Types,
	score: number,
	position: number,
	gameHeight: number
) => {
	const i4 = score % 10 & 1;
	const i3 = (score % 10 >> 1) & 1;
	const i2 = (score % 10 >> 2) & 1;
	const i1 = (score % 10 >> 3) & 1;
	const unit_size = 8;

	// for (let x = 0; x * unit_size < p5.width / 2; x++) {
	// 	for (let y = 0; y * unit_size < p5.height / 2; y++) {
	// 		if ((x + y) % 2) p5.fill(255, 0, 0);
	// 		else p5.fill(0, 255, 255);

	// 		p5.rect(unit_size * x, y * unit_size, unit_size, unit_size);
	// 		p5.rect(-x * unit_size, y * unit_size, unit_size, unit_size);
	// 		p5.rect(x * unit_size, -y * unit_size, unit_size, unit_size);
	// 		p5.rect(-x * unit_size, -y * unit_size, unit_size, unit_size);
	// 	}
	// }

	const fillColors = [p5.color(0, 0, 0, 0), p5.color(255, 255, 255)];
	p5.push();
	p5.translate(position, -gameHeight / 4);
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
	isPlayerLeft: number,
	gameWidth: number,
	gameHeight: number
) {
	p5.push();
	draw7Segment(
		p5,
		score.player,
		-isPlayerLeft * (gameWidth / 2 - 160),
		gameHeight
	);
	draw7Segment(
		p5,
		score.advers,
		isPlayerLeft * (gameWidth / 2 - 160),
		gameHeight
	);
	p5.pop();
}
