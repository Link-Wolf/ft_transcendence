import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

const Auth = () => {
	const user = useContext(UserContext);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		setIsLoggedIn(user.clearance !== 0);
	}, [user]);
	return (
		<>
			{isLoggedIn ? <ProfileButton login={user.login} /> : <AuthButton />}
		</>
	);
};

const AuthButton = () => {
	/**
	 *	Redirect the user to the 42 intra login page
	 */
	return (
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
			Login
		</Link>
	);
};

const ProfileButton = ({ login }: { login: string }) => {
	/**
	 * Redirect the user to their profile page
	 */
	return <Link to={`/profile/${login}`}>Profile</Link>;
};

export default Auth;
