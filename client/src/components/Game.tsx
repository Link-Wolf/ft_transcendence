import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import { UserContext } from "../App";
import GameRender from "./GameRender/GameRender";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
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
	const [loop, setLoop] = useState<NodeJS.Timer>();

	//listen to history or smth to send quitRoom (/quitGame) when leaving the page

	useEffect(() => {
		if (!user.clearance || user.clearance === 0) return;
		const startGame = (payload: any) => {
			setGameInfo(payload);
			setHasFoundGame(true);
		};

		const local_loop = setInterval(() => {
			socket.emit("joinWaitRoom", {
				auth: Cookies.get("token"),
				isRanked: true, //TODO: add option for ranked mode
			});
		}, 1000);

		setLoop(local_loop);

		socket.on("startGame", startGame);

		return () => {
			socket.off("startGame", startGame);
			clearInterval(local_loop);
		};
	}, [user]);

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
					clearInterval(loop);
					setHasFoundGame(false);
					setMustGoHome(true);
				}
			}
		);
	};

	if (mustGoHome) return <Navigate to='/' />;
	if (!hasFoundGame) return <WaitingForMatch cancelSearch={cancelSearch} />;
	clearInterval(loop);
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
