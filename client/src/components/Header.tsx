import { Link } from "react-router-dom";
import Auth from "./Auth";
import logo from "../assets/placeholder_logo.png"; // TODO: Replace with actual logo
import style from "../style/Header.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = () => {
	return (
		<ul className={style.banner}>
			<li>
				<Link to='/'>
					<img src={logo} alt='Logo' className={style.logo} />
				</Link>
			</li>
			<li>P L A T Y P O N G D</li>
			<li>
				<ul className={style.right_section}>
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
