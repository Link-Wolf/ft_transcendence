import { Link } from "react-router-dom";
import Auth from "./Auth";
import logo from "../assets/placeholder_logo.png";
import brand from "../assets/brandname.png";
import style from "../style/Header.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
import { useContext } from "react";
import { UserContext } from "../App";

const Header = () => {
	/**
	 * Header component, display the logo, the name of the app and the auth component
	 */
	const user = useContext(UserContext);

	return (
		<ul className={style.banner} id='header'>
			<li>
				<Link to='/'>
					<img src={logo} alt='Logo' className={style.logo} />
					<img src={brand} alt='PlatyPong' className={style.brand} />
				</Link>
			</li>
			<li>
				<ul className={style.right_section}>
					<li>
						<ThemeSwitcher />
					</li>
					<li>
						<Auth />
					</li>
				</ul>
			</li>
		</ul>
	);
};

export default Header;
