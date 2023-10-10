import Sketch from "react-p5";
import p5Types from "p5";

import drawMovables from "./drawMovables";
import drawMiddleLine from "./drawMiddleLine";
import drawScore from "./drawScore";
import displayTurnText from "./displayTurnText";
import { useContext } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";
import { screenShake } from "./screenShake";
import { drawPowerUpsName } from "./drawPowerUpsName";

let playerKeys = new Set<number>();

const GameRender = ({ gameId }: { gameId: string }) => {
	const user = useContext(UserContext);
	let game = {
		gameId: gameId,
		players: [
			{
				login: "player1",
				score: 0,
				paddle: {
					position: { x: -0 / 2 + 10, y: 0 },
					size: { w: 10, h: 0 },
					velocity: { dx: 0, dy: 0 },
					effect: [],
				},
				inputs: [],
				lastInput: Date.now(),
			},
			{
				login: "player2",
				score: 0,
				paddle: {
					position: { x: 0 / 2 - 10, y: 0 },
					size: { w: 10, h: 0 },
					velocity: { dx: 0, dy: 0 },
					effect: 0,
				},
				inputs: [],
				lastInput: Date.now(),
			},
		],
		balls: [
			{
				position: { x: 0, y: 0 },
				velocity: { dx: 0, dy: 0 },
				size: { radius: 5 },
				lastUser: null,
			},
		],
		powerUps: [],
		obstacles: [],
		width: 0,
		height: 0,
		lastTimestamp: Date.now(),
		playerToStart: 0,
		isTurnStarted: false,
		turn: 0,
		nbBounces: 0,
		status: {
			ended: false,
			winner: null,
			gonePlayer: null,
		},
		loop: null,
		myIndex: -1,
		powerUpName: "",
		powerUpColor: "",
		powerUpDisplayDuration: 0,
		screenShake: 0,
	};
	let scale = 1;

	socket.on("gameUpdate", (data) => {
		if (data.gameId === gameId) game = { ...game, ...data };
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
		calculateScale();
		p5.resizeCanvas(game.width * scale, game.height * scale);
		if (game.myIndex === -1) {
			game.myIndex = game.players.findIndex(
				(player) => player.login === user.login
			);
			return;
		}
		p5.scale(scale);
		p5.translate(game.width / 2, game.height / 2);
		screenShake(p5, game);
		p5.background(0);
		p5.rectMode(p5.CENTER);

		drawMiddleLine(p5, game.height);
		p5.push();
		if (game.myIndex === 1) {
			p5.scale(-1, 1);
		}
		drawMovables(p5, [
			...game.players
				.map((player: any) => player.paddle)
				.map((rect_stuff: any) => ({
					type: "rectangle",
					...rect_stuff,
					...{
						position: {
							...rect_stuff.position,
							x:
								(game.width / 2 - 40) *
								Math.sign(rect_stuff.position.x),
						},
						size: { ...rect_stuff.size, w: 10 },
					},
				})),
			...game.balls.concat(game.powerUps).map((round_stuff: any) => ({
				type: "circle",
				...round_stuff,
			})),
			...game.obstacles.map((rect_stuff: any) => ({
				type: rect_stuff.shape,
				...rect_stuff,
			})),
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
		drawPowerUpsName(p5, game);
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
			style={{
				width: "100vw",
				display: "flex",
				justifyContent: "center",
			}}
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
