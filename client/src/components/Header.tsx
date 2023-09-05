import { Link } from "react-router-dom";
import Auth from "./Auth";
import logo from "../assets/placeholder_logo.png"; // TODO: Replace with actual logo
import style from "../style/Header.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
import { useContext } from "react";
import { UserContext } from "../App";
import Notifications from "./Notifications/Notifications";

const Header = () => {
	/**
	 * Header component, display the logo, the name of the app and the auth component
	 */
	const user = useContext(UserContext);

	return (
		<ul
			className={style.banner}
			id='header'
		>
			<li>
				<Link to='/'>
					<img
						src={logo}
						alt='Logo'
						className={style.logo}
					/>
				</Link>
			</li>
			<li>P L A T Y P O N G</li>
			<li>
				<ul className={style.right_section}>
					{user.clearance > 0 && <Notifications />}
					<li>
						<Auth />
					</li>
					<li>
						<ThemeSwitcher />
					</li>
				</ul>
			</li>
		</ul>
	);
};

export default Header;
