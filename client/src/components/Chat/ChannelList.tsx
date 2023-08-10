import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import AddChannelMenu from "./AddChannelMenu";
import style from "../../style/Chat.module.scss";

const ChannelList = ({ setChannel }: { setChannel: Function }) => {
	const [channels, setChannels] = useState<String[]>([]);
	const [newChannelVisibility, setNewChannelVisibility] = useState(false);
	const context = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${context.login}`
			)
			.then((response) => {
				setChannels(
					response.data.map(
						(membership: any) => membership.channelName
					)
				);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

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
