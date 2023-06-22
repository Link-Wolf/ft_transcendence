import { Link } from "react-router-dom";

const Home = () => {
	/**
	 * Home page
	 */

	return (
		<div>
			<h1>Home</h1>
			<p>Home page buddy</p>
			<Link to='/game'>Play</Link>
		</div>
	);
};

export default Home;
