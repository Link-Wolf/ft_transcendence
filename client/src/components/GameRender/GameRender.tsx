import Sketch from "react-p5";
import p5Types from "p5";

import Movable from "./Movable";
import paddleBounce from "./paddleBounce";
import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import physic from "./physic";
import drawScore from "./drawScore";
import inputHandler from "./inputHandler";
import displayTurnText from "./displayTurnText";
import checkForScoreUpdate from "./checkForScoreUpdate";
import { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";

let playerPaddles: Movable[] = [];
let adversPaddles: Movable[] = [];
let balls: Movable[] = [];
let modifierMovables: Movable[] = [];
let score = {
	player: 0,
	advers: 0,
};
let playerKeys = new Set<number>();
let adversKeys = new Set<number>();

const GameRender = ({
	gameId,
	isNew,
	modifiers,
	playerToStart,
	players,
}: {
	gameId: number;
	isNew: boolean;
	modifiers: any[];
	playerToStart: number;
	players: string[];
}) => {
	const user = useContext(UserContext);
	let game = {
		players: [
			{
				paddle: {
					size: {
						w: 0,
						h: 0,
					},
					position: {
						x: 0,
						y: 0,
					},
					velocity: {
						dx: 0,
						dy: 0,
					},
				},
				score: 0,
				inputs: [],
				login: "",
			},
			{
				paddle: {
					size: {
						w: 0,
						h: 0,
					},
					position: {
						x: 0,
						y: 0,
					},
					velocity: {
						dx: 0,
						dy: 0,
					},
				},
				score: 0,
				inputs: [],
				login: "",
			},
		],
		ball: {
			size: {
				radius: 0,
			},
			position: {
				x: 0,
				y: 0,
			},
			velocity: {
				dx: 0,
				dy: 0,
			},
		},
		turn: 0,
		playerToStart: 0,
		isTurnStarted: false,
		gameId: 0,
		lastTimestamp: 0,
		height: 600,
		width: 800,
	};

	useEffect(() => {
		socket.on("gameUpdate", (data) => {
			console.log(data);
			game = data;
		});

		return () => {
			socket.off("gameUpdate");
		};
	});

	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(game.width, game.height).parent(canvasParentRef);
		p5.frameRate(60);
		p5.noStroke();
	};

	const draw = (p5: p5Types) => {
		p5.translate(game.width / 2, game.height / 2);
		p5.background(0);
		p5.rectMode(p5.CENTER);
		p5.fill(255);
		p5.rect(
			game.players[0].paddle.position.x,
			game.players[0].paddle.position.y,
			game.players[0].paddle.size.w,
			game.players[0].paddle.size.h
		);
		p5.rect(
			game.players[1].paddle.position.x,
			game.players[1].paddle.position.y,
			game.players[1].paddle.size.w,
			game.players[1].paddle.size.h
		);
		p5.ellipse(
			game.ball.position.x,
			game.ball.position.y,
			game.ball.size.radius,
			game.ball.size.radius
		);
	};

	return (
		<Sketch
			setup={setup}
			draw={draw}
			keyPressed={(p5) => {
				playerKeys.add(p5.keyCode);
				socket.volatile.emit("keys", {
					login: user.login,
					keys: Array.from(playerKeys),
					gameId: gameId,
				});
			}}
			keyReleased={(p5) => {
				playerKeys.delete(p5.keyCode);
				socket.volatile.emit("keys", {
					login: user.login,
					keys: Array.from(playerKeys),
					gameId: gameId,
				});
			}}
		/>
	);
};

export default GameRender;
