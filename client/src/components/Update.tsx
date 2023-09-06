import axios from "axios";
import { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import QRCode from "react-qr-code";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import Dropzone, { useDropzone } from "react-dropzone";
import socket from "../socket";

const ISSUER = "Platypong";

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
	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragAccept,
		isDragReject,
	} = useDropzone({ accept: { "image/*": [] } });

	const style = useMemo(
		() => ({
			...baseStyle,
			...(isFocused ? focusedStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
		}),
		[isFocused, isDragAccept, isDragReject]
	);

	return (
		<>
			<PPDisplayer
				login={login}
				size={400}
				status={false}
			>
				<img
					src={imageSource}
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
		</>
	);
};

const Update = () => {
	/**
	 * Update component, display the user's settings
	 */
	const context = useContext(UserContext);
	const [user, setUser] = useState<any>({});
	const [nameError, setNameError] = useState<string>("");
	const [TFASecret, setTFASecret] = useState<string>("");
	const [codeValue, setCodeValue] = useState<string>("");
	const [form, setForm] = useState({
		name: "",
		avatar: "",
		hasTFA: false,
		TFASecret: "",
	});
	const [codeError, setCodeError] = useState<string>("");

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${context.login}`
			)
			.then((res) => {
				setUser(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	if (!context.clearance || context.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	const handleFormChange = (e: any) => {
		//if the input contains not only letters, log an error
		if (e.target.id === "name") {
			if (e.target.value.length < 3) {
				setNameError("Username must be at least 3 characters long");
			} else if (e.target.value.length > 15) {
				setNameError("Username must be at most 15 characters long");
			} else if (!/^[a-zA-Z]+$/.test(e.target.value)) {
				setNameError("Username must only contain letters");
			} else if (
				e.target.value.length === 3 ||
				e.target.value.length === 5 ||
				e.target.value.length === 7 ||
				e.target.value.length === 11 ||
				e.target.value.length === 13
			) {
				setNameError("Username lenght must not be prime");
			} else {
				setNameError("");
			}
		}
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const updateUsername = async () => {
		if (nameError !== "") return;
		await axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/name/${form.name}`
			)
			.then((res) => {
				if (res.data) {
					if (res.data.login === context.login) {
						setForm({ ...form, name: "" });
						return;
					}
					setNameError("Username already taken");
				} else {
					axios
						.patch(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${context.login}`,
							{
								name: form.name,
							}
						)
						.then(() => {
							setForm({ ...form, name: "" });
							//TODO: update the context somehow ??
							// socket.emit("contextUpdate", {
							// 	login: context.login,
							// });
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
		return;
	};

	const wannaEnableTFA = async () => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/generateSecret/${context.login}`
			)
			.then((res) => {
				setTFASecret(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleInputChange = (value: string) => {
		//check if  the value is a number
		if (!/^\d+$/.test(value) && value !== "") return;
		setCodeValue(value);
	};

	const verifyTFA = async () => {
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/enableTFA/${context.login}`,
				{
					code: codeValue,
				}
			)
			.then((res) => {
				if (res.data) {
					setForm({ ...form, hasTFA: true });
					setCodeError("");
				} else {
					setCodeError("Wrong 2FA code");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const disableTFA = async () => {
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/disableTFA/${context.login}`
			)
			.then(() => {
				setForm({ ...form, hasTFA: false });
				setTFASecret("");
				setCodeValue("");
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<>
			<h2>Settings</h2>
			<form>
				<div>
					<label>Username</label>
					{nameError !== "" && <div>{nameError}</div>}
					<input
						id='name'
						type='text'
						value={form.name}
						onChange={handleFormChange}
						placeholder='myAwesomeNewUsername'
					/>
					<button
						type='button'
						onClick={updateUsername}
						disabled={nameError !== ""}
					>
						Change username
					</button>
				</div>
				<div>
					<PPChanger login={user.login} />
				</div>
			</form>
			{!form.hasTFA ? (
				TFASecret === "" ? (
					<button
						type='button'
						onClick={wannaEnableTFA}
					>
						Activate 2FA
					</button>
				) : (
					<div className='BONJOUR JE SUIS UN POP UP MERCI'>
						<h1>Two-Factor Authentication (2FA) Activation</h1>
						<h3>Configure Google Authenticator or Authy</h3>
						<ul>
							<li>
								Install Google Authenticator or Authy (both IOS
								- Android)
							</li>
							<li>In the authenticator app, select '+' icon</li>
							<li>
								Select "Scan a barcode (or QR code)" and use the
								phone's camera to scan this barcode
							</li>
						</ul>
						<h3>Scan this QR code with your authenticator app</h3>
						<QRCode
							value={`otpauth://totp/${user.login}?secret=${TFASecret}&issuer=${ISSUER}`}
							size={256}
							level='H'
						/>
						<h4>Or enter this code manually in your app</h4>
						<label>Secret Key: {TFASecret}</label>
						<h3>Verifiy code</h3>
						<label>
							To validate the 2FA activation, please verify the
							authentication code
						</label>
						<input
							value={codeValue}
							autoFocus={true}
							maxLength={6}
							placeholder='Authentication code'
							onChange={(e) => handleInputChange(e.target.value)}
						/>
						{codeError !== "" && <div>{codeError}</div>}
						<button
							type='button'
							onClick={verifyTFA}
						>
							Verify and activate 2FA
						</button>
						<button
							type='button'
							onClick={() => {
								setTFASecret("");
								setCodeValue("");
							}}
						>
							Cancel
						</button>
					</div>
				)
			) : (
				<button
					type='button'
					onClick={disableTFA}
				>
					Disable 2FA
				</button>
			)}
		</>
	);
};

export default Update;
