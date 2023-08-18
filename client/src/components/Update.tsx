import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";

const Update = () => {
	/**
	 * Update component, display the user's settings
	 */
	const context = useContext(UserContext);
	const [user, setUser] = useState<any>({});
	const [nameError, setNameError] = useState<string>("");
	const [form, setForm] = useState({
		name: "",
		avatar: "",
		hasTFA: false,
		TFASecret: "",
	});

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
				<div>
					<label>TFA</label>
					<input type='text' />
				</div>
				<button onChange={updateProfile}>Update</button>
			</form>
		</>
	);
};

export default Update;
