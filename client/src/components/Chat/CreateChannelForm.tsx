import axios from "axios";
import { useContext, useState, useEffect, useMemo } from "react";
import { UserContext } from "../../App";
import style from "../../style/Chat.module.scss";

const CreateChannelForm = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * Form to create a channel
	 */
	const user = useContext(UserContext);
	const [data, setData] = useState({ name: "", pass: "" });
	// const [nameError, setNameError] = useState("");
	const [passError, setPassError] = useState("");
	const [chanNames, setChanNames] = useState<string[]>([]);

	const tutors = JSON.parse(
		process.env.REACT_APP_TUTORS ?? '["yoyostud"]'
	) as string[];

	const nameError = useMemo(() => {
		if (data.name === "") return "";
		if (chanNames.includes(data.name))
			return "Channel name is already taken";
		if (data.name.match(/[^a-zA-Z0-9]/g))
			return "Channel name can only contain letters and numbers";
		return "";
	}, [data.name, chanNames]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/channel/all/names`
			)
			.then((response) => {
				setChanNames(response.data);
			});
	}, []);

	useEffect(() => {
		if (data.pass === "") {
		} else if (data.pass.length < 8) {
			setPassError("Password must be at least 8 characters long");
			return;
		} else if (
			!tutors.some((tutor) => {
				return data.pass.includes(tutor);
			})
		) {
			setPassError(
				"Password must contain at least one login of the currents tutors (in lowercase)"
			);
		} else if (!data.pass.includes(data.pass.length.toString())) {
			setPassError("Password must contain the length of the password");
		} else if (
			!((n) => {
				for (let i = 2; i < Math.sqrt(n); i++) {
					if (!(n % i)) return false;
				}
				return true;
			})(data.pass.length)
		) {
			setPassError("Password length must be a prime number");
		} else if (
			data.pass.toLowerCase().includes(user.login[0].toLowerCase())
		) {
			setPassError(
				"For security reasons, the password can not contains the first letter of the channel owner login (you)"
			);
		} else {
			setPassError("");
		}
	}, [data.pass, tutors, user.login]);

	const handleFormChange = (e: any) => {
		setData({ ...data, [e.target.id]: e.target.value });
	};

	const createChannel = async () => {
		if (nameError !== "" || passError !== "") return;
		await axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel`,
				{
					userLogin: user.login,
					name: data.name,
					password: data.pass,
				}
			)
			.then(async (response) => {
				try {
					const created_channel = await axios.post(
						`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/toxic-relations/membership`,
						{
							chanName: response.data.name,
							userLogin: user.login,
							isAdmin: false,
						}
					);
					setChannel(created_channel.data.channelName);
				} catch (error) {
					console.log(error);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div className={style.mpscroll}>
			<form className={style.form}>
				<label className={style.param}>
					<label>Channel name</label>
					<input
						className={style.inputchannelform}
						id='name'
						type='text'
						value={data.name}
						onChange={handleFormChange}
						placeholder='myAwesomeChannel'
					/>
				</label>
				{nameError !== "" && <pre>{nameError}</pre>}
				{/* <br/> */}
				<label className={style.param}>
					<label>Password (optional)</label>
					<input
						className={style.inputchannelform}
						id='pass'
						type='password'
						value={data.pass}
						onChange={handleFormChange}
					/>
				</label>
				{passError !== "" && <pre>{passError}</pre>}
				<button
					type='button'
					onClick={createChannel}
					disabled={passError !== "" || nameError !== ""}
				>
					Create
				</button>
			</form>
		</div>
	);
};

export default CreateChannelForm;
