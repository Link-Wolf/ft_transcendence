import { useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import GameRender from "./GameRender/GameRender";
import { redirect, useNavigate, useParams } from "react-router-dom";
import style from "../style/Game.module.scss";
import load from "../assets/load.gif";
import { join } from "path";
import { clear } from "console";

const Game = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const gameId = useParams().id;
	const navigate = useNavigate();

	let joinInterval: NodeJS.Timer;

	const cancelSearch = () => {
		navigate("/");
	};

	useEffect(() => {
		const joinGame = () => {
			socket.emit(
				"joinGame",
				{
					gameId: gameId,
					auth: Cookies.get("token"),
				},
				(
					res: {
						action: "redirect" | "play" | "wait" | "error";
						newId?: string;
						message?: string;
					},
					error: any
				) => {
					if (error || res.action === "error") {
						console.log(error || res.message);
						clearInterval(joinInterval as NodeJS.Timer);
						navigate("/");
						return;
					}
					if (res.action === "redirect") {
						clearInterval(joinInterval as NodeJS.Timer);
						navigate(`/game/${res.newId}`);
						return;
					}
					if (res.action === "play") {
						clearInterval(joinInterval as NodeJS.Timer);
						setLoading(false);
						return;
					}
				}
			);
		};

		joinGame();
		clearInterval(joinInterval as NodeJS.Timer);
		joinInterval = setInterval(joinGame, 1000);

		return () => {
			clearInterval(joinInterval as NodeJS.Timer);
		};
	}, []);

	if (loading) return <WaitingForMatch cancelSearch={cancelSearch} />;
	return <GameRender gameId={gameId as string} />;
};

const WaitingForMatch = ({ cancelSearch }: { cancelSearch: Function }) => {
	return (
		<>
			<div className={style.playsearch}>
				<img src={load} className={style.load}></img>
				<div>Search and loading</div>
				<button
					className={style.button}
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
