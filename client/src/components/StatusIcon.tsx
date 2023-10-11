import { useEffect, useState } from "react";
import style from "../style/StatusIcon.module.scss";
import socket from "../socket";

const StatusIcon = ({ login, size }: { login: string; size: number }) => {
	const [status, setStatus] = useState(
		"" as "" | "online" | "offline" | "playing"
	);

	const colorTheme = (status: string) => {
		if (status === "online") return { background: "#00ff00" };
		if (status === "offline") return { background: "#ff0000" };
		if (status === "playing") return { background: "#0000ff" };
	};

	useEffect(() => {
		socket.emit(
			"getStatus",
			{ login },
			(status: "online" | "offline" | "playing") => {
				setStatus(status);
			}
		);

		socket.on(
			"statusUpdate",
			(data: {
				login: string;
				status: "online" | "offline" | "playing";
			}) => {
				if (data.login === login) setStatus(data.status);
			}
		);

		return () => {
			socket.off("statusUpdate");
		};
	}, []);

	return <div className={style.status} style={colorTheme(status)}></div>;
};

export default StatusIcon;
