import { useEffect, useState } from "react";

const Home = () => {
	/**
	 * Home page
	 */

	const [game, setGame] = useState(false);

	return (
		<div>
			<h1>Home</h1>
			<p>Home page buddy</p>
			{!game ? (
				<MatchMaking setIsGaming={setGame} />
			) : (
				<>OUI Y A UNE PARTIE LA EN FAIT</>
			)}
		</div>
	);
};

const MatchMaking = ({ setIsGaming }: { setIsGaming: Function }) => {
	const [searching, setSearching] = useState(false);

	useEffect(() => {
		if (!searching) return;

		/*
		 *	\// TODO: wath's described below
		 * Update user status to searching
		 * Or match him with another player
		 */
	}, [searching]);

	const lookingForMatch = () => {
		setSearching(!searching);
	};

	return !searching ? (
		<>
			<div>Lancer une partie</div>
			<button onClick={lookingForMatch}>Play</button>
		</>
	) : (
		<>
			<div>Recherche en cours . . .</div>
			<div>*inserer animation de recherche*</div>
			<button onClick={lookingForMatch}>Cancel</button>
		</>
	);
};

export default Home;
