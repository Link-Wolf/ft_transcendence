import { Link } from "react-router-dom";
import Auth from "./Auth";
import logo from "../assets/placeholder_logo.png"; // TODO: Replace with actual logo
import style from "../style/Header.module.scss";

const Header = () => {
	return (
		<>
			<h1>[Header]</h1>
			<ul>
				<li>
					<Link to='/'>
						Image de Platypong (logo site, redirect to Home)
					</Link>
				</li>
				<li>P L A T Y P O N G</li>
				<li>
					<Auth />
				</li>
			</ul>
		</>
	);
};

export default Header;
