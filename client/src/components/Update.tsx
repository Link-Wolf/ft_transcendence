import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import QRCode from "react-qr-code";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";

const ISSUER = "Platypong";

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

	useEffect(() => {
		if (form.name === "" || form.name === user.name) return;
		if (form.name.length < 3) {
			setNameError("Username must be at least 3 characters long");
		} else if (!/^[a-zA-Z]+$/.test(form.name)) {
			setNameError("Username must only contain letters");
		} else {
			setNameError("");
		}
	}, [form.name]);

	if (!context.clearance || context.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	const handleFormChange = (e: any) => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const updateProfile = async () => {
		//TODO: update profile
		return;
	};

	const wannaEnableTFA = async () => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/generateSecret/${context.login}`
			)
			.then((res) => {
				// setForm({ ...form, TFASecret: res.data.secret });
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
					<input
						id='name'
						type='text'
						value={form.name}
						onChange={handleFormChange}
						placeholder='myAwesomeNewUsername'
					/>
					{nameError !== "" && <div>{nameError}</div>}
				</div>
				<div>
					<PPDisplayer
						login={context.login}
						size={400}
						status={false}
					/>
					<input type='file' />
				</div>
				<div></div>
				<button onChange={updateProfile}>Update</button>
			</form>
			{!form.hasTFA ? (
				TFASecret === "" ? (
					<button onClick={wannaEnableTFA}>Activate 2FA</button>
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
						<button onClick={verifyTFA}>
							Verify and activate 2FA
						</button>
						<button
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
				<button onClick={disableTFA}>Disable 2FA</button>
			)}
		</>
	);
};

export default Update;
