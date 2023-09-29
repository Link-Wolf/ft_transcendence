import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import AddChannelMenu from "./AddChannelMenu";
import style from "../../style/Chat.module.scss";
import socket from "../../socket";

const ChannelList = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * List of channels, either display the list of channels the user is in, or the menu to join/create a channel
	 */
	const [channels, setChannels] = useState<String[]>([]);
	const [newChannelVisibility, setNewChannelVisibility] = useState(false);
	const [update, setUpdate] = useState(true);
	const context = useContext(UserContext);

	useEffect(() => {
		const channelUpdate = (payload: any) => {
			setUpdate(true);
		};

		socket.on("membershipUpdate", channelUpdate);

		return () => {
			socket.off("membershipUpdate", channelUpdate);
		};
	}, []);

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${context.login}/channel_names`
			)
			.then((response) => {
				setChannels(response.data);
			})
			.catch((err) => {
				console.log(err);
			});
		setUpdate(false);
	}, [context.login, update]);

	const addChannel = () => {
		setNewChannelVisibility(!newChannelVisibility);
	};

	return (
		<div className={style.channelList}>
			<h1>Channel List</h1>
			<button onClick={addChannel}>
				{newChannelVisibility ? <>x</> : <>+</>}
			</button>
			{newChannelVisibility ? (
				<AddChannelMenu setChannel={setChannel} />
			) : (
				<>
					{channels.length ? (
						channels.map((channel, i) => (
							<button key={i} onClick={() => setChannel(channel)}>
								{channel}
							</button>
						))
					) : (
						<div>Tu n'as encore rejoins aucun channel bébé sel</div>
					)}
				</>
			)}
		</div>
	);
};

export default ChannelList;
