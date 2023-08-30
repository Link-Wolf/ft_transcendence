import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../App";
import axios from "axios";
import { PPDisplayer } from "../../ImageDisplayer";

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
	const [password, setPassword] = useState("");
	const [passError, setPassError] = useState("");

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channelName}`
			)
			.then((res) => {
				setChannel(res.data);
				setHasPassword(res.data.password !== "");
				setUpdate(false);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [update]);

	return (
		<>
			<div>
				{hasPassword ? (
					<>
						<input
							type='password'
							value='mhhbaguette'
							disabled={true}
						/>
						<button type='button'>Change password</button>
						<button type='button'>Remove password</button>
					</>
				) : (
					<>
						<button type='button'>Add password</button>
					</>
				)}
			</div>
			<div>
				Ur admins sir' :
				{admins.map((admin, i) => (
					<div key={i}>
						<AdminCardIdk login={admin} />
					</div>
				))}
			</div>
		</>
	);
};

const AdminCardIdk = ({ login }: { login: string }) => {
	return (
		<>
			<PPDisplayer login={login} size={30} status={true} />
			{login}
			<button type='button'
			// onClick={()=> demote(login)}
			>Demote</button>
		</>
	);
};

export default ChannelSettings;
