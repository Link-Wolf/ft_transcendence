export type Rectangle = {
	type: "rectangle";
	position: {
		x: number;
		y: number;
	};
	size: {
		w: number;
		h: number;
	};
	velocity: {
		dx: number;
		dy: number;
	};
	color: string;
};

export type Circle = {
	type: "circle";
	position: {
		x: number;
		y: number;
	};
	size: {
		radius: number;
	};
	velocity: {
		dx: number;
		dy: number;
	};
	color: string;
};

type Movable = Circle | Rectangle;

export default Movable;
