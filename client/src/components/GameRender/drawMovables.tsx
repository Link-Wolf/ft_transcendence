import p5Types from "p5";
import Movable from "./Movable";

export default function drawMovables(p5: p5Types, movables: Movable[]) {
	p5.push();
	for (let object of movables) {
		p5.fill(object.color);
		if (object.type === "rectangle")
			p5.rect(
				object.position.x,
				object.position.y,
				object.size.w,
				object.size.h
			);
		else if (object.type === "circle")
			p5.circle(
				object.position.x,
				object.position.y,
				object.size.radius * 2
			);
	}
	p5.pop();
}
