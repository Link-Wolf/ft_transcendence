import { Link } from "react-router-dom";
import Auth from "./Auth";

const Header = () => {
	return (
		<>
			<h1>Header</h1>
			<ul>
				<li>
					<ul>
						<li>
							<Link to='/'>Home</Link>
						</li>
						<li>Playfield</li>
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
		</>
	);
};

export default Header;
