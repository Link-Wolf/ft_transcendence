import { useContext } from "react";
import { UserContext } from "../App";
import style from "../style/StatusIcon.module.scss";

const StatusIcon = ({ login }: { login: string }) => {
	const status = useContext(UserContext).status;
	const colorTheme = (status: string) => {
		if (status === "online") return { background: "#00ff00" };
		if (status === "offline") return { background: "#ff0000" };
		if (status === "in-game") return { background: "#ffff00" };
	};

	return (
		<div
			className={style.status}
			style={colorTheme(status[login].status)}
		></div>
	);
};

export default StatusIcon;
