import { useContext } from "react";
import { UserContext } from "../App";
import style from "../style/StatusIcon.module.scss";

const StatusIcon = ({ login, size }: { login: string; size: number }) => {
	const colorTheme = (status: string) => {
		if (status === "online") return { background: "#00ff00" };
		if (status === "offline") return { background: "#ff0000" };
		if (status === "playing") return { background: "#0000ff" };
	};

	return <div className={style.status} style={colorTheme("online")}></div>;
};

export default StatusIcon;
