import { useContext } from "react";
import { UserContext } from "../App";
import style from "../style/ThemeSwitcher.module.scss";

const ThemeSwitcher = () => {
	const session = useContext(UserContext);

	return (
		<div className={style.toggle_switch}>
			<label>
				<input
					type='checkbox'
					checked={session.theme == "light"}
					onChange={session.toggleTheme}
				/>
				<span className={style.slider}></span>
			</label>
		</div>
	);
};

export default ThemeSwitcher;
