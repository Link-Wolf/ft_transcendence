import { MouseEventHandler, useContext, useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import { UserContext } from "../App";
import axios from "axios";
import GameRender from "./GameRender/GameRender";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { use } from "matter-js";

const Game = () => {
	const [hasFoundGame, setHasFoundGame] = useState(false);
	const [gameInfo, setGameInfo] = useState({
		gameId: 0,
		isNew: false,
		modifiers: [],
		playerToStart: 0,
		players: [],
	});
	const user = useContext(UserContext);

	//listen to history or smth to send quitRoom (/quitGame) when leaving the page

	useEffect(() => {
		if (!user.clearance || user.clearance === 0) return;
		const startGame = (payload: any) => {
			setGameInfo(payload);
			setHasFoundGame(true);
		};

		socket.emit("joinWaitRoom", {
			auth: Cookies.get("token"),
			isRanked: true, //TODO: add option for ranked mode
		});

		socket.on("startGame", startGame);

		return () => {
			socket.off("startGame", startGame);
		};
	}, []);

	useEffect(() => {
		let loop = setInterval(() => {
			socket.emit("joinWaitRoom", {
				auth: Cookies.get("token"),
				isRanked: true, //TODO: add option for ranked mode
			});
		}, 1000);

		return () => {
			clearInterval(loop);
		};
	}, []);

	if (!user.clearance || user.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	const isLookingForMatch = () => {
		//TODO: emit quitRoom et attendre la reponse avant de go back home
	};

	if (!hasFoundGame)
		return <WaitingForMatch setLookingForMatch={isLookingForMatch} />;
	return <GameRender {...gameInfo} />;
};

const WaitingForMatch = ({
	setLookingForMatch,
}: {
	setLookingForMatch: Function;
}) => {
	return (
		<>
			<div>Recherche en cours . . .</div>
			<div>*inserer animation de recherche*</div>
			<button
				onClick={() => {
					setLookingForMatch();
				}}
			>
				Cancel
			</button>
		</>
	);
};

export default Game;
