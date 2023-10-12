import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Link } from "react-router-dom";
import style from "../style/Game.module.scss";
import socket from "../socket";

const PlayableGamesList = () => {
	const user = useContext(UserContext);
	const [playableGames, setPlayableGames] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsVisible(true);
		}, 0);
	}, []);

	useEffect(() => {
		socket.on("gameUpdate", (data: any) => {
			if (data.invitee === user.login || data.invitee === "*") {
				setUpdate(true);
			}
		});

		return () => {
			socket.off("gameUpdate");
		};
	}, []);

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}/api/game/playable`
			)
			.then((res) => {
				setPlayableGames(res.data);
			})
			.catch((error) => {
				console.log(error);
			});
		setUpdate(false);
	}, [user, update]);

	return (
		<div className={`${style.playablegamelist} ${isVisible && style.show}`}>
			<h1><pre>P E N D I N G   G A M E S</pre></h1>
			{playableGames.length === 0 && (
				<div className={style.gameplayable}>
					<p> No game at this moment, let's create one below !</p>
				</div>
			)}
			{playableGames.map(
				(game: any, i: number) =>
					game.status === "invitation" && (
						<div key={i} className={style.gameplayable}>
							<p>
								<pre>I N V I T A T I O N   B Y {": "}</pre>
								{game.users[0].name}
								<Link to={`/game/${game.id}`}>
									<button className={style.joinbutton}>
										J O I N
									</button>
								</Link>
							</p>
							<div className={style.modifierslist}>
								{game.modifiers.length > 0 && "Modifiers: "}
								{game.modifiers.length > 0 &&
									game.modifiers.map(
										(modifier: any, j: number) => (
											<label key={j}>
												{modifier.name}
											</label>
										)
									)}
							</div>
						</div>
					)
			)}
			{playableGames.map(
				(game: any, i: number) =>
					game.status === "waiting" && (
						<div key={i} className={style.gameplayable}>
							{/* {game.id} : {game.isRanked ? "" : "Un"}ranked */}
							<p>
								<pre>G A M E   N°{i + 1} :{" "}</pre>
								{game.isRanked ? "Ranked" : "Unranked"}
								<Link to={`/game/${game.id}`}>
									<button className={style.joinbutton}>
										J O I N
									</button>
								</Link>
							</p>
							<div className={style.modifierslist}>
								{game.modifiers.length > 0 && "Modifiers :"}
								{game.modifiers.length > 0 &&
									game.modifiers.map(
										(modifier: any, j: number) => (
											<label key={j}>
												{modifier.name}
											</label>
										)
									)}
							</div>
						</div>
					)
			)}
		</div>
	);
};
export default PlayableGamesList;
