import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import { UserContext } from "../App";
import GameRender from "./GameRender/GameRender";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { Navigate } from "react-router-dom";
import style from "../style/Game.module.scss";
import load from "../assets/load.gif"


const Game = () => {
	/**
	 * Game component, display the game if the user is logged in and has the required clearance
	 */
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

		setLoop(
			setInterval(() => {
				socket.emit("joinWaitRoom", {
					auth: Cookies.get("token"),
					isRanked: true, //TODO: add option for ranked mode
				});
			}, 1000)
		);

		socket.on("startGame", startGame);

		return () => {
			socket.off("startGame", startGame);
			clearInterval(loop);
		};
	}, [user]);

	useEffect(() => {
		if (!hasFoundGame) return;
		clearInterval(loop);
	}, [hasFoundGame]);

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
	return <GameRender {...gameInfo} />;
};

const WaitingForMatch = ({ cancelSearch }: { cancelSearch: Function }) => {
	return (
		<>
		<div className={style.playsearch}>
			<img src={load} className={style.load}></img>
			<div>Recherche en cours . . .</div>
			<button className={style.button}
				onClick={() => {
					cancelSearch();
				}}
				>
				Cancel
			</button>
		</div>
		</>
	);
};

export default Game;
