import { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";

const Home = () => {
	/**
	 * Home page, display a link to the game page if the user is logged in, or a link to the login page if the user is not logged in
	 */

	const user = useContext(UserContext);

	return (
		<div>
			<h1>Home</h1>
			<p>Home page buddy</p>
			{user.clearance > 0 ? (
				<>
					<Link to='/game'>Play</Link>
					<PPDisplayer
						login={user.login}
						size={200}
						status={true}
					/>
				</>
			) : (
				<Link
					to={
						`https://api.intra.42.fr/oauth/authorize?` +
						`client_id=${process.env.REACT_APP_INTRA_UID}&` +
						`redirect_uri=${encodeURIComponent(
							`${process.env.REACT_APP_PROTOCOL}://` +
								`${process.env.REACT_APP_HOSTNAME}:` +
								`${process.env.REACT_APP_FRONTEND_PORT}/login`
						)}&` +
						`response_type=code`
					}
				>
					Connect to play
				</Link>
			)}
		</div>
	);
};

export default Home;
