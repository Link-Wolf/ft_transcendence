import React, { useEffect, useState } from "react";
import axios from "axios";

const PPDisplayer = ({ login, size }: { login: string; size: number }) => {
	const [imageURL, setImageURL] = useState("");

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((response) => {
				setImageURL(`data:image/*;base64,${response.data.avatar}`);
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
	}, [login]);

	return (
		<div>
			{imageURL ? (
				<img src={imageURL} style={{ width: size, height: size }} />
			) : (
				<p>Loading image...</p>
			)}
		</div>
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
				<img src={imageURL} style={{ maxWidth: "300px" }} />
			) : (
				<p>Loading image...</p>
			)}
		</div>
	);
};

export { PPDisplayer, ImageDisplayer };
