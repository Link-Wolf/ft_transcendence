import { MouseEventHandler, useContext, useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import { UserContext } from "../App";
import axios from "axios";
import GameRender from "./GameRender/GameRender";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { use } from "matter-js";
import { Navigate } from "react-router-dom";

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
	const [mustGoHome, setMustGoHome] = useState(false);

	//listen to history or smth to send quitRoom (/quitGame) when leaving the page

	useEffect(() => {
		if (!user.clearance || user.clearance === 0) return;
		const startGame = (payload: any) => {
			setGameInfo(payload);
			setHasFoundGame(true);
		};

		let loop = setInterval(() => {
			socket.emit("joinWaitRoom", {
				auth: Cookies.get("token"),
				isRanked: true, //TODO: add option for ranked mode
			});
		}, 1000);

		socket.on("startGame", startGame);

		return () => {
			socket.off("startGame", startGame);
			clearInterval(loop);
		};
	}, []);

	if (!user.clearance || user.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	const cancelSearch = () => {
		console.log("canceling search");
		socket.emit(
			"quitWaitRoom",
			{
				auth: Cookies.get("token"),
				isRanked: true, //TODO: add option for ranked mode
			},
			(res: any) => {
				console.log("canceling search callback", res);
				if (res === 200) {
					console.log("search canceled");
					setHasFoundGame(false);
					setMustGoHome(true);
				}
			}
		);
	};

	if (mustGoHome) return <Navigate to='/' />;
	if (!hasFoundGame) return <WaitingForMatch cancelSearch={cancelSearch} />;
	return <GameRender {...gameInfo} />;
};

const WaitingForMatch = ({ cancelSearch }: { cancelSearch: Function }) => {
	return (
		<>
			<div>Recherche en cours . . .</div>
			<div>*inserer animation de recherche*</div>
			<button
				onClick={() => {
					cancelSearch();
				}}
			>
				Cancel
			</button>
		</>
	);
};

export default Game;
