import { useContext } from "react";
import { UserContext } from "../App";
import style from "../style/ThemeSwitcher.module.scss";
import { useLocation } from "react-router-dom";

const ThemeSwitcher = () => {
	/**
	 * ThemeSwitcher component, display a switch to toggle between light and dark theme
	 */
	const session = useContext(UserContext);
	const location = useLocation();

	if (location.pathname.startsWith("/game")) return <></>;
	return (
		<div className={style.toggle_switch}>
			<label>
				<input
					type='checkbox'
					checked={session.theme === "light"}
					onChange={session.toggleTheme}
				/>
				<span className={style.slider}></span>
			</label>
		</div>
	);
};

export default ThemeSwitcher;
