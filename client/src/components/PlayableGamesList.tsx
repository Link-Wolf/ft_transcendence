import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { use } from "matter-js";
import { error } from "console";

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
				setPlayableGames(res.data);
			})
			.catch((error) => console.log(error));
		setUpdate(false);
	}, [user, update]);

	return (
		<div>
			{playableGames.map((game: any, i: number) => (
				<ul key={i}>
					<li>{game.id}</li>
				</ul>
			))}
		</div>
	);
};
export default PlayableGamesList;
