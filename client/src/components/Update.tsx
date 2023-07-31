import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";

const Update = () => {
	const user = useContext(UserContext);

	const [form, setForm] = useState({
		name: "",
		avatar: "",
		hasTFA: false,
		TFASecret: "",
	});

	useEffect(() => {}, []);

	if (!user.clearance || user.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	return (
		<>
			<h2>Update</h2>
			<form>
				<div>
					<label>Username</label>
					<input type='text' value={form.name} />
				</div>
				<div>
					<PPDisplayer login={user.login} size={400} />
					<input type='file' />
				</div>
				<div>
					<label>TFA</label>
					<input type='text' />
				</div>
				<button>Update</button>
			</form>
		</>
	);
};

export default Update;
