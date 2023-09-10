import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { DropEvent, useDropzone } from "react-dropzone";
import { PPDisplayer } from "./ImageDisplayer";
import { validateImage } from "image-validator";

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
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		if (!login || !update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((res) => {
				setImageSource(res.data.avatar);
				setUpdate(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [login]);

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
			getBase64(file).then((result) => {
				setImageSource((result as string).split(",")[1]);
			});
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
		await axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/pp/${login}`
			)
			.then((res) => {
				setUpdate(true);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<>
			<PPDisplayer
				login={login}
				size={200}
				status={false}
			>
				<img
					src={`data:image/*;base64,${imageSource}`}
					alt='profile picture'
				/>
			</PPDisplayer>

			<div className='container'>
				<div {...getRootProps({ style })}>
					<input {...getInputProps()} />
					<p>
						Drag 'n' drop some files here, or click to select files
					</p>
				</div>
			</div>

			<button
				type='button'
				disabled={!imageSource}
				onClick={upload}
			>
				Upload to the CLOUD (it is not a cloud)
			</button>
		</>
	);
};

export default PPChanger;
