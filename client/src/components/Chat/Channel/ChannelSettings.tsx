import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../App";
import axios from "axios";
import { PPDisplayer } from "../../ImageDisplayer";
import { DemoteButton } from "../../ActionsButtons";

const ChannelSettings = ({
	channelName,
	owner,
	admins,
}: {
	channelName: string;
	owner: string;
	admins: string[];
}) => {
	const user = useContext(UserContext);

	const [update, setUpdate] = useState(true);

	const [channel, setChannel] = useState<any>(null);
	const [hasPassword, setHasPassword] = useState(false);
	const [passError, setPassError] = useState("");
	const [updatePassword, setUpdatePassword] = useState(false);

	const [passValue, setPassValue] = useState("mhhbaguette");

	const tutors = JSON.parse(
		process.env.REACT_APP_TUTORS ?? '["yoyostud"]'
	) as string[];

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channelName}`
			)
			.then((res) => {
				console.log(res.data);
				setChannel(res.data);
				setHasPassword(!!res.data.password);
				setUpdate(false);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [update]);

	useEffect(() => {
		if (passValue === "" || !hasPassword) {
		} else if (passValue.length < 8) {
			setPassError("Password must be at least 8 characters long");
			return;
		} else if (
			!tutors.some((tutor) => {
				return passValue.includes(tutor);
			})
		) {
			setPassError(
				"Password must contain at least one login of the currents tutors (in lowercase)"
			);
		} else if (!passValue.includes(passValue.length.toString())) {
			setPassError("Password must contain the length of the password");
		} else if (
			!((n) => {
				for (let i = 2; i < Math.sqrt(n); i++) {
					if (!(n % i)) return false;
				}
				return true;
			})(passValue.length)
		) {
			setPassError("Password length must be a prime number");
		} else if (
			passValue.toLowerCase().includes(user.login[0].toLowerCase())
		) {
			setPassError(
				"For security reasons, the password can not contains the first letter of the channel owner login (you)"
			);
		} else {
			setPassError("");
		}
	}, [passValue, tutors, user.login]);

	const removePassword = () => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channelName}`,
				{
					password: null,
				}
			)
			.then((res) => {
				setUpdate(true);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const wannaEditPassword = () => {
		setUpdatePassword(true);
		setPassValue("");
		setHasPassword(true);
	};

	const editPassword = () => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channelName}`,
				{
					password: passValue,
				}
			)
			.then((res) => {
				setUpdate(true);
				setUpdatePassword(false);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	const cancelChange = () => {
		if (channel.password === "yesyesno") setPassValue("mhhbaguette");
		else setHasPassword(false);
		setPassError("");
		setUpdatePassword(false);
		setUpdate(true);
	};

	const handleFormChange = (e: any) => {
		setPassValue(e.target.value);
	};

	if (!channel) return <></>;
	console.log(channel, owner, admins, hasPassword, updatePassword, passValue);
	return (
		<>
			<div>
				{hasPassword && (
					<input
						id='password'
						type='password'
						value={passValue}
						disabled={hasPassword && !updatePassword}
						onChange={handleFormChange}
						placeholder='my_new_password'
					/>
				)}
				{hasPassword && !updatePassword ? (
					<>
						<button type='button' onClick={wannaEditPassword}>
							Change password
						</button>
						<button type='button' onClick={removePassword}>
							Remove password
						</button>
					</>
				) : (
					!updatePassword && (
						<>
							<button type='button' onClick={wannaEditPassword}>
								Add password
							</button>
						</>
					)
				)}
				{hasPassword && updatePassword && (
					<>
						{passError !== "" && <p>{passError}</p>}
						<button type='button' onClick={cancelChange}>
							Cancel
						</button>
						<button
							type='button'
							onClick={editPassword}
							disabled={passError !== ""}
						>
							Apply Change
						</button>
					</>
				)}
			</div>
			<div>
				Ur admins sir' :
				{admins.map((admin, i) => (
					<div key={i}>
						<AdminCardIdk login={admin} channel={channelName} />
					</div>
				))}
			</div>
		</>
	);
};

const AdminCardIdk = ({
	login,
	channel,
}: {
	login: string;
	channel: string;
}) => {
	return (
		<>
			<PPDisplayer login={login} size={30} status={true} />
			{login}
			<DemoteButton login={login} channel={channel} />
		</>
	);
};

export default ChannelSettings;
