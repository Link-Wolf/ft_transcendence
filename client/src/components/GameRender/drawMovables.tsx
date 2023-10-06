import p5Types from "p5";
import Movable from "./Movable";

export default function drawMovables(p5: p5Types, movables: Movable[]) {
	p5.push();
	for (let object of movables) {
		p5.fill(object.color);
		if (object.type === "circle") {
			p5.stroke("#ffffff");
			p5.strokeWeight(5);
			p5.circle(
				object.position.x,
				object.position.y,
				object.size.radius * 2
			);
			p5.textSize(10);
			p5.text(
				object.color === "green"
					? "↑"
					: object.color === "red"
					? "↓"
					: "o",
				object.position.x,
				object.position.y,
				object.size.radius * 2,
				object.size.radius * 2
			);
			p5.textAlign(p5.CENTER, p5.CENTER);
		} else if (object.type === "rectangle")
			p5.rect(
				object.position.x,
				object.position.y,
				object.size.w,
				object.size.h
			);
	}
	p5.pop();
}
