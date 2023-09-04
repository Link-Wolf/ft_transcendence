import p5Types from "p5";
import Movable from "./Movable";

export default function drawMovables(
	p5: p5Types,
	movables: Movable[],
	scale: number
) {
	for (let object of movables) {
		if (object.type === "rectangle")
			p5.rect(
				object.position.x * scale,
				object.position.y * scale,
				object.size.w * scale,
				object.size.h * scale
			);
		else if (object.type === "circle")
			p5.circle(
				object.position.x * scale,
				object.position.y * scale,
				object.size.radius * scale
			);
	}
}
