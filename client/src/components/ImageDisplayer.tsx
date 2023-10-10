import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import StatusIcon from "./StatusIcon";
import style from "../style/PPDisplayer.module.scss";
import Loading from "./Loading";
import socket from "../socket";

const PPDisplayer = ({
	login,
	size,
	children,
	status,
}: {
	login: string;
	size: number;
	status: boolean;
	children?: React.ReactNode;
}) => {
	/**
	 * PPDisplayer component, display the user's avatar and status
	 */
	const [image, setImage] = useState<string | null>(null);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		socket.on("contextUpdate", (payload) => {
			if (payload.login === login) setUpdate(true);
		});

		return () => {
			socket.off("contextUpdate");
		};
	}, []);

	useMemo(() => {
		setUpdate(true);
	}, [login]);

	useEffect(() => {
		if (children) return;
		if (!update) return;
		if (!login) return;
		setImage(null);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/pp/${login}`
			)
			.then((response) => {
				setImage(response.data);
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
		setUpdate(false);
	}, [login, update, children]);

	return (
		<>
			{image || children ? (
				<div
					style={{
						width: size,
						height: size,
					}}
					className={style.PPDisplayer}
				>
					{children ?? <img src={`data:image/*;base64,${image}`} />}
					{status && <StatusIcon login={login} size={size} />}
				</div>
			) : (
				<Loading size={size} />
			)}
		</>
	);
};

export { PPDisplayer };
