import p5Types from "p5";

export default function drawMiddleLine(p5: p5Types) {
	p5.push();
	p5.stroke(255);
	p5.strokeWeight(1);
	for (let i = -p5.height / 2 - 5; i < p5.height / 2; i += 20) {
		p5.line(0, i, 0, i + 10);
	}
	p5.pop();
}
