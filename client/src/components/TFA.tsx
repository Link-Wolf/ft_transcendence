import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNotifications } from "./Notifications";
import PopUp from "./PopUp";


const TFA = () => {
	const [form, setForm] = useState({
		tfacode: "",
	});
	const login = useParams().login;
	const notifications = useNotifications();

	const checkTFA = async () => {
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/verifyTFA/${login}`,
				{
					code: form.tfacode,
				}
			)
			.then((res) => {
				if (res.data) {
					window.location.href = "/";
				} else {
					notifications.error("Error","Wrong TFA code");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleFormChange = (e: any) => {
		if (!/^\d+$/.test(e.target.value) && e.target.value !== "") return;
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	return (
		<PopUp
			setPopup={() => {}}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					checkTFA();
				}}>
				<input
					value={form.tfacode}
					id='tfacode'
					type='text'
					autoFocus={true}
					maxLength={6}
					placeholder='Authentication code'
					onChange={(e) =>
						handleFormChange(e)
					}
				/>
				<button type='submit'>
					Submit
				</button>
			</form>
		</PopUp>
	);
};

export default TFA;


