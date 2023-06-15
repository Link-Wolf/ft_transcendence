import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClearanceContext } from "../App";

const Auth = () => {
	const clearance = useContext(ClearanceContext);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		setIsLoggedIn(clearance !== 0);
	}, [clearance]);
	return <>{isLoggedIn ? <ProfileButton /> : <AuthButton />}</>;
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
					String(process.env.REACT_APP_INTRA_REDIRECT)
				)}&` +
				`response_type=code`
			}
		>
			Login
		</Link>
	);
};

const ProfileButton = () => {
	/**
	 * Redirect the user to the profile page
	 */
	return <Link to='/profile'>Profile</Link>;
};

export default Auth;
