import { Link } from "react-router-dom";
import Auth from "./Auth";
import logo from "../assets/placeholder_logo.png"; // TODO: Replace with actual logo
import style from "../style/Header.module.scss";

const Header = () => {
	return (
		<ul className={style.banner}>
			<li>
				<ul>
					<li>
						<Link to='/'>Home</Link>
					</li>
					{/* <li>Playfield</li> */}
				</ul>
			</li>
			<li>
				<ul>
					<li>
						<img src={logo} alt='logo' />
					</li>
				</ul>
			</li>
			<li>
				<ul>
					<li>
						<Auth />
					</li>
				</ul>
			</li>
		</ul>
	);
};

export default Header;
