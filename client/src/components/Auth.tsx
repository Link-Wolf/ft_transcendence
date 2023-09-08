import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import style from "../style/Header.module.scss";


const Auth = () => {
	/**
	 * Display the login button if the user is not logged in, or the profile button if the user is logged in
	 */
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
			<button className={style.login}>Login</button>
		</Link>
	);
};

const ProfileButton = ({ login }: { login: string }) => {
	/**
	 * Redirect the user to their profile page
	 */
	return <Link to={`/profile/${login}`}><span className={style.img}><PPDisplayer login={login} size={50} status={true}/></span></Link>;
};

export default Auth;
