import p5Types from "p5";
import Movable from "./Movable";

export default function drawMovables(p5: p5Types, movables: Movable[]) {
	p5.push();
	for (let object of movables) {
		p5.fill(object.color);
		if (object.type === "circle") {
			if (object.color !== "white") {
				p5.push();
				p5.fill("white");
				p5.rect(
					object.position.x,
					object.position.y,
					object.size.radius * 2,
					object.size.radius * 2
				);
				p5.pop();
				p5.stroke("#ffffff");
				p5.strokeWeight(5);
			}
			p5.circle(
				object.position.x,
				object.position.y,
				object.size.radius * 2
			);
			if (object.color !== "white") {
				p5.textSize(20);
				p5.noStroke();
				p5.fill("#ffffff");
				p5.textAlign(p5.CENTER, p5.CENTER);
				p5.text(
					object.color === "#4C823C"
						? "↑"
						: object.color === "#8C1B1B"
						? "↓"
						: "○",
					object.position.x,
					object.position.y
				);
			}
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
