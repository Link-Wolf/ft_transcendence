import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { use } from "matter-js";
import { error } from "console";
import { Link } from "react-router-dom";
import style from "../style/Game.module.scss";


const PlayableGamesList = () => {
	const user = useContext(UserContext);
	const [playableGames, setPlayableGames] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);

	useEffect(() => {
		// listen to modications of the playable games list
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
				console.log(res.data);
				setPlayableGames(res.data);
			})
			.catch((error) => console.log(error));
		setUpdate(false);
	}, [user, update]);

	return (
		<div className={style.playablegamelist}>
			{/* <h1> P L A Y A B L E _ G A M E _ L I S T</h1> */}
			{playableGames.length === 0 && 
			<div className={style.gameplayable}>
			<p> Any game at this moments</p>
			</div>
			}
			{playableGames.map((game: any, i: number) => (
				<div key={i} className={style.gameplayable}>
						{/* {game.id} : {game.isRanked ? "" : "Un"}ranked */}
						<p>G A M E _ N*{i + 1} : {game.isRanked ? "" : "Un"}ranked
							<Link to={`/game/${game.id}`}><button className={style.joinbutton}>J O I N</button></Link></p>
						<div className={style.modifierslist}>
							{game.modifiers.map((modifier: any, j: number) => (
								<p key={j}>{modifier.name}</p>
							))}
						</div>
				</div>
			))}
		</div>
	);
};
export default PlayableGamesList;
