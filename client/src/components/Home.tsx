const Home = () => {
	/**
	 * Home page
	 */
	return (
		<div>
			<h1>Home</h1>
			<p>Home page buddy</p>
			<MatchMaking />
		</div>
	);
};

const MatchMaking = () => {
	return (
		<>
			<div>Lancer une partie</div>
			<button>Play</button>
		</>
	);
};

export default Home;
