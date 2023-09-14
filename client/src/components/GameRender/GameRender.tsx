import Sketch from "react-p5";
import p5Types from "p5";

import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import drawScore from "./drawScore";
import displayTurnText from "./displayTurnText";
import { useContext } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";

let playerKeys = new Set<number>();

const GameRender = ({ gameId }: { gameId: string }) => {
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
		status: {
			ended: false,
			winner: null,
			gonePlayer: null,
		},
	};
	let scale = 1;

	socket.on("gameUpdate", (data) => {
		game = { ...game, ...data };
	});

	function getAbsoluteHeight(el: HTMLElement | null): number {
		// Get the DOM Node if you pass in a string
		if (!el) return 0;
		var elHeight = el.offsetHeight;
		elHeight += parseInt(
			window.getComputedStyle(el).getPropertyValue("margin-top")
		);
		elHeight += parseInt(
			window.getComputedStyle(el).getPropertyValue("margin-bottom")
		);

		return elHeight;
	}

	const calculateScale = () => {
		const view_width = window.innerWidth;
		const view_height =
			window.innerHeight -
			getAbsoluteHeight(document.getElementById("header"));

		const game_ratio = game.width / game.height;
		const view_ratio = view_width / view_height;
		scale =
			view_ratio > game_ratio
				? view_height / game.height
				: view_width / game.width;
	};

	const setup = (p5: p5Types, canvasParentRef: Element) => {
		calculateScale();
		p5.createCanvas(game.width * scale, game.height * scale).parent(
			canvasParentRef
		);
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
		p5.scale(scale);
		p5.translate(game.width / 2, game.height / 2);
		p5.background(0);
		p5.rectMode(p5.CENTER);

		drawMiddleLine(p5, game.height);
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
			game.myIndex === 0 ? 1 : -1,
			game.width,
			game.height
		);
		displayTurnText(p5, game);
	};

	const windowResized = (p5: p5Types) => {
		calculateScale();
		p5.resizeCanvas(game.width * scale, game.height * scale);
	};

	return (
		<Sketch
			setup={setup}
			draw={draw}
			windowResized={windowResized}
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
