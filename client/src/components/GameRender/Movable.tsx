export default class Movable {
	public size: { w: number; h: number };
	public position: { x: number; y: number };
	public velocity: { dx: number; dy: number };
	public facing: number;
	public onColide: (object: Movable, ball: Movable) => void;
	public type: string;

	constructor(
		size = { w: 0, h: 0 },
		position = { x: 0, y: 0 },
		velocity = { dx: 0, dy: 0 },
		facing = 0,
		onColide = (object: Movable, ball: Movable) => {},
		type = "rectangle"
	) {
		this.size = size;
		this.position = position;
		this.velocity = velocity;
		this.onColide = onColide;
		this.facing = facing;
		this.type = type;
	}
}
