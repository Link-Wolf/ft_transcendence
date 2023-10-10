import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { DropEvent, useDropzone } from "react-dropzone";
import { PPDisplayer } from "./ImageDisplayer";
import { validateImage } from "image-validator";
import socket from "../socket";

const baseStyle = {
	flex: 1,
	display: "flex",
	flexDirection: "column" as "column",
	alignItems: "center",
	padding: "20px",
	borderWidth: 2,
	borderRadius: 2,
	borderColor: "#eeeeee",
	borderStyle: "dashed",
	backgroundColor: "#fafafa",
	color: "#bdbdbd",
	outline: "none",
	transition: "border .24s ease-in-out",
	width: "400px",
};

const focusedStyle = {
	borderColor: "#2196f3",
};

const acceptStyle = {
	borderColor: "#00e676",
};

const rejectStyle = {
	borderColor: "#ff1744",
};

const PPChanger = ({ login }: { login: string }) => {
	const [imageSource, setImageSource] = useState<string>("");
	const [currentAvatar, setCurrentAvatar] = useState<string>("");
	const [imageSourceToBeSend, setImageSourceToBeSend] = useState<File>();
	const [imageError, setImageError] = useState<string>("");
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		if (!login || !update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/pp/${login}`
			)
			.then((res) => {
				setImageSource(res.data);
				setCurrentAvatar(res.data);
				setImageError("");
				setUpdate(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [login, update]);

	const getBase64 = (file: File) => {
		return new Promise((resolve) => {
			let baseURL = "" as string | ArrayBuffer | null;
			// Make new FileReader
			let reader = new FileReader();

			// Convert the file to base64 text
			reader.readAsDataURL(file);

			// on reader load something...
			reader.onload = () => {
				// Make a fileInfo Object
				baseURL = reader.result;
				resolve(baseURL);
			};
		});
	};

	const updateAvatar = async (files: File[], event: DropEvent) => {
		if (!files.length) return;
		const file = files[0];
		if (await validateImage(file)) {
			setImageError("");

			const canvas = document.createElement("canvas");
			canvas.width = 500;
			canvas.height = 500;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				setImageError("Error while processing image");
				setImageSource("");
				return;
			}
			const reader = new FileReader();

			reader.onload = (event) => {
				const image = new Image();
				if (event.target === null) {
					setImageError("Error while processing image");
					setImageSource("");
					return;
				}
				image.src = event.target.result as string;

				image.onload = () => {
					const size = Math.min(image.width, image.height);
					const x = (image.width - size) / 2;
					const y = (image.height - size) / 2;

					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(image, x, y, size, size, 0, 0, 500, 500);

					canvas.toBlob((blob) => {
						if (!blob) return;

						const newFile = new File([blob], file.name, {
							type: file.type,
						});

						setImageSourceToBeSend(newFile);
						getBase64(newFile).then((result) => {
							setImageSource((result as string).split(",")[1]);
						});
					}, "image/jpeg");
				};

				image.onerror = (error) => {
					setImageError("Error while processing image");
					setImageSource("");
				};
			};

			reader.onerror = (error) => {
				setImageError("Error while processing image");
				setImageSource("");
			};

			reader.readAsDataURL(file);
		} else {
			setImageError("Invalid image");
			setImageSource("");
		}
	};

	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		accept: { "image/*": [] },
		onDropAccepted: updateAvatar,
		multiple: false,
	});

	const style = useMemo(
		() => ({
			...baseStyle,
			...(isFocused ? focusedStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
		}),
		[isFocused, isDragAccept, isDragReject]
	);

	const upload = async () => {
		if (!imageSource || imageSource === currentAvatar) return;
		const formData = new FormData();
		formData.append("avatar", imageSourceToBeSend as Blob);
		await axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/pp/${login}`,
				formData
			)
			.then((res) => {
				setUpdate(true);
				socket.emit("contextUpdate", { login: login });
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<>
			<PPDisplayer login={login} size={200} status={false}>
				<img src={`data:image/*;base64,${imageSource}`} alt='avatar' />
			</PPDisplayer>

			<div className='container'>
				<div {...getRootProps({ style })}>
					<input {...getInputProps()} />
					<p>Click to select file</p>
				</div>
				{imageError && <p>{imageError}</p>}
			</div>

			<button
				type='button'
				// disabled={!imageSource || imageSource === currentAvatar}
				onClick={upload}
			>
				Update avatar
			</button>
		</>
	);
};

export default PPChanger;
