import p5Types from "p5";

export default function drawMiddleLine(p5: p5Types, scale: number) {
	p5.push();
	p5.stroke(255);
	p5.strokeWeight(1 * scale);
	for (let i = -p5.height / 2 - 5; i < p5.height / 2; i += 20) {
		p5.line(0, i * scale, 0, (i + 10) * scale);
	}
	p5.pop();
}
