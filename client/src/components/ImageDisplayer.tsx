import React, { useEffect, useState } from "react";
import axios from "axios";
import StatusIcon from "./StatusIcon";
import style from "../style/PPDisplayer.module.scss";

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
	const [image, setImage] = useState(children);

	useEffect(() => {
		if (children) return;
		if (!login) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((response) => {
				setImage(
					<img src={`data:image/*;base64,${response.data.avatar}`} />
				);
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
	}, [login, children]);

	return (
		<>
			{image ? (
				<div
					style={{
						width: size,
						height: size,
					}}
					className={style.PPDisplayer}
				>
					{image}
					{status && <StatusIcon login={login} size={size} />}
				</div>
			) : (
				<p>Loading image...</p>
			)}
		</>
	);
};

const ImageDisplayer = ({ what }: { what: string }) => {
	const [imageURL, setImageURL] = useState("");

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/TODO:smtg//${what}`,
				{
					responseType: "arraybuffer",
				}
			)
			.then((response) => {
				const imageBlob = new Blob([response.data]);
				setImageURL(URL.createObjectURL(imageBlob));
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
	}, [what]);

	return (
		<div>
			{imageURL ? (
				<img src={imageURL} alt='' style={{ maxWidth: "300px" }} />
			) : (
				<p>Loading image...</p>
			)}
		</div>
	);
};

export { PPDisplayer, ImageDisplayer };
