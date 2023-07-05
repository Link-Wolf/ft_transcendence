import p5Types from "p5";

export default class Movable {
	public p5: p5Types;
	public size: { w: number; h: number };
	public position: { x: number; y: number };
	public velocity: { dx: number; dy: number };
	public facing: number;
	public onColide: (object: Movable, ball: Movable, values: any) => void;
	public type: string;

	constructor(
		p5: p5Types,
		size = { w: 0, h: 0 },
		position = { x: 0, y: 0 },
		velocity = { dx: 0, dy: 0 },
		facing = 0,
		onColide = (object: Movable, ball: Movable, values: any) => {},
		type = "rectangle"
	) {
		this.p5 = p5;
		this.size = size;
		this.position = position;
		this.velocity = velocity;
		this.onColide = onColide;
		this.facing = facing;
		this.type = type;
	}

	public move() {
		this.position.x += (this.velocity.dx * this.p5.deltaTime) / 1000;
		this.position.y += (this.velocity.dy * this.p5.deltaTime) / 1000;
		if (this.position.x < -this.p5.width / 2 + this.size.w / 2) {
			this.position.x = -this.p5.width / 2 + this.size.w / 2;
			this.velocity.dx *= -1;
		}
		if (this.position.x > this.p5.width / 2 - this.size.w / 2) {
			this.position.x = this.p5.width / 2 - this.size.w / 2;
			this.velocity.dx *= -1;
		}
		if (this.position.y < -this.p5.height / 2 + this.size.h / 2) {
			this.position.y = -this.p5.height / 2 + this.size.h / 2;
			this.velocity.dy *= -1;
		}
		if (this.position.y > this.p5.height / 2 - this.size.h / 2) {
			this.position.y = this.p5.height / 2 - this.size.h / 2;
			this.velocity.dy *= -1;
		}
	}

	public collide(ball: Movable) {
		if (this.type === "rectangle") {
			return (
				(ball.position.x -
					Math.max(
						this.position.x - this.size.w / 2,
						Math.min(
							ball.position.x,
							this.position.x + this.size.w / 2
						)
					)) **
					2 +
					(ball.position.y -
						Math.max(
							this.position.y - this.size.h / 2,
							Math.min(
								ball.position.y,
								this.position.y + this.size.h / 2
							)
						)) **
						2 <
				ball.size.w ** 2
			);
		}
		if (this.type === "circle") {
			return (
				(this.position.x - ball.position.x) ** 2 +
					(this.position.y - ball.position.y) ** 2 <
				(this.size.w / 2 + ball.size.w / 2) ** 2
			);
		}
	}
}
