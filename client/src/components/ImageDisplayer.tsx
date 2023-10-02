import React, { useEffect, useState } from "react";
import axios from "axios";
import StatusIcon from "./StatusIcon";
import style from "../style/PPDisplayer.module.scss";
import Loading from "./Loading";

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

	useEffect(() => {
		if (children) return;
		if (!login) return;
		setImage(null);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((response) => {
				setImage(response.data.avatar);
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
	}, [login, children]);

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
