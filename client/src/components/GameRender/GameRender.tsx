import Sketch from "react-p5";
import p5Types from "p5";

import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import drawScore from "./drawScore";
import displayTurnText from "./displayTurnText";
import { useContext, useEffect } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";

let playerKeys = new Set<number>();

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
		myIndex: -1,
		isOver: false,
	};

	useEffect(() => {
		socket.on("gameUpdate", (data) => {
			console.log(data);
			game = { ...game, ...data };
		});

		return () => {
			socket.off("gameUpdate");
		};
	});

	const setup = (p5: p5Types, canvasParentRef: Element) => {
		p5.createCanvas(game.width, game.height).parent(canvasParentRef);
		p5.frameRate(60);
		p5.noStroke();
		game.myIndex = game.players.findIndex(
			(player) => player.login === user.login
		);
	};

	const draw = (p5: p5Types) => {
		if (game.myIndex === -1) {
			game.myIndex = game.players.findIndex(
				(player) => player.login === user.login
			);
			return;
		}
		p5.translate(game.width / 2, game.height / 2);
		p5.background(0);
		p5.rectMode(p5.CENTER);

		drawMiddleLine(p5);
		p5.push();
		if (game.myIndex === 1) {
			p5.scale(-1, 1);
		}
		drawMovables(p5, [
			{
				type: "rectangle",
				...game.players[0].paddle,
			},
			{
				type: "rectangle",
				...game.players[1].paddle,
			},
			{
				type: "circle",
				...game.ball,
			},
		]);
		p5.pop();
		drawScore(
			p5,
			{
				player: game.players[0].score,
				advers: game.players[1].score,
			},
			game.myIndex === 0 ? 1 : -1
		);
		displayTurnText(p5, game);
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
