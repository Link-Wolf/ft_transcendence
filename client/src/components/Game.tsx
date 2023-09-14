import { useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";
import GameRender from "./GameRender/GameRender";
import { useNavigate, useParams } from "react-router-dom";
import style from "../style/Game.module.scss";
import load from "../assets/load.gif";
import { join } from "path";

const Game = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [joinInterval, setJoinInterval] = useState<NodeJS.Timer | undefined>(
		undefined
	);
	const gameId = useParams().id;
	const navigate = useNavigate();

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
					console.log(res);
					if (error) return;
					if (res.action === "redirect") {
						clearInterval(joinInterval as NodeJS.Timer);
						navigate(`/game/${res.newId}`);
						return;
					}
					if (res.action === "play") {
						setLoading(false);
						clearInterval(joinInterval as NodeJS.Timer);
						return;
					}
				}
			);
		};

		joinGame();
		setJoinInterval(setInterval(joinGame, 1000));

		return () => {
			clearInterval(joinInterval as NodeJS.Timer);
		};
	}, []);

	if (loading) return <WaitingForMatch cancelSearch={() => {}} />;
	return <GameRender gameId={gameId as string} />;
};

const WaitingForMatch = ({ cancelSearch }: { cancelSearch: Function }) => {
	return (
		<>
			<div className={style.playsearch}>
				<img src={load} className={style.load}></img>
				<div>Recherche en cours . . .</div>
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
