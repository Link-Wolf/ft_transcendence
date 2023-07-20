import React, { useEffect, useState } from "react";
import axios from "axios";
// const Buffer = require("node").Buffer;
const PPDisplayer = ({ login }: { login: string }) => {
	const [imageURL, setImageURL] = useState("");

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((response) => {
				let imgString = "";
				for (let i = 0; i < response.data.avatar.data.length; i++) {
					imgString += String.fromCharCode(
						response.data.avatar.data[i]
					);
				}
				const imgb64 = btoa(imgString);
				setImageURL(`data:image/*;base64,${imgb64}`);
			})
			.catch((error) => {
				console.error("Error fetching image:", error);
			});
	}, [login]);

	return (
		<div>
			{imageURL ? (
				<img
					src={imageURL}
					alt='Uploaded'
					style={{ maxWidth: "300px" }}
				/>
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
				<img
					src={imageURL}
					alt='Uploaded'
					style={{ maxWidth: "300px" }}
				/>
			) : (
				<p>Loading image...</p>
			)}
		</div>
	);
};

export { PPDisplayer, ImageDisplayer };
