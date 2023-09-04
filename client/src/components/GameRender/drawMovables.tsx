import p5Types from "p5";
import Movable from "./Movable";

export default function drawMovables(p5: p5Types, movables: Movable[]) {
	for (let object of movables) {
		if (object.type === "rectangle")
			p5.rect(
				object.position.x,
				object.position.y,
				object.size.w,
				object.size.h
			);
		else if (object.type === "circle")
			p5.circle(object.position.x, object.position.y, object.size.radius);
	}
}
