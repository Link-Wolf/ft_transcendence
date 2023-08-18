import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import CreateChannelForm from "./CreateChannelForm";

const AddChannelMenu = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * Add channel menu, either create a channel or join one
	 */
	const [channels, setChannels] = useState<any[]>([]);
	const [channelCreation, setChannelCreation] = useState(false);
	const [joinChannel, setJoinChannel] = useState<any>(null);
	const user = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/public/me`
			)
			.then((response) => {
				setChannels(
					response.data.sort(
						(a: any, b: any) => a.createdAt - b.createdAt
					)
				);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		if (!joinChannel) return;
		if (joinChannel.password) {
			const password = prompt("Password");
			if (password !== joinChannel.password) {
				alert("Wrong password");
				return;
			}
		}

		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership`,
				{
					chanName: joinChannel.name,
					userLogin: user.login,
					isAdmin: false,
				}
			)
			.then((joined_channel) => {
				setChannel(joined_channel.data.channelName);
			})
			.catch((error) => {
				console.log(error);
			});
	}, [joinChannel, setChannel, user.login]);

	const createChannel = () => {
		setChannelCreation(!channelCreation);
	};

	return (
		<>
			{channelCreation ? (
				<>
					<button onClick={createChannel}>Annuler</button>
					<CreateChannelForm setChannel={setChannel} />
				</>
			) : (
				<>
					<button onClick={createChannel}>Creer un channel</button>
					{channels.map((channel, i) => (
						<div key={i}>
							<button onClick={() => setJoinChannel(channel)}>
								{channel.name} {channel.password ? "🔒" : <></>}
							</button>
						</div>
					))}
				</>
			)}
		</>
	);
};

export default AddChannelMenu;
