import axios from "axios";
import { useState } from "react";
import {  useParams } from "react-router-dom";

const TFA = () => {
	const [form, setForm] = useState({
		tfacode: "",
	});
	const login = useParams().login;

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
					alert("Wrong TFA code");
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleFormChange = (e: any) => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	return (
		<form>
			<input
				id='tfacode'
				type='text'
				onChange={handleFormChange}
				value={form.tfacode}
				placeholder='ur tfa number'
			/>
			<button type='button' onClick={checkTFA}>
				Submit
			</button>
		</form>
	);
};

export default TFA;
