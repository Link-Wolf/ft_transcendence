import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import CreateChannelForm from "./CreateChannelForm";
import socket from "../../socket";
import style from "../../style/Chat.module.scss";

const AddChannelMenu = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * Add channel menu, either create a channel or join one
	 */
	const [channels, setChannels] = useState<any[]>([]);
	const [channelCreation, setChannelCreation] = useState(false);
	const [joinChannel, setJoinChannel] = useState<any>(null);
	const [canIBebouPlz, setCanIBebouPlz] = useState(false);
	const user = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/toxic-relations/public/me`
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
		if (joinChannel.password === "yesyesno") {
			const password = prompt("Password"); //TODO: replace

			axios
				.post(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${joinChannel.name}/passwd`,
					{
						password: password,
						userLogin: user.login,
					}
				)
				.then((response) => {
					if (!response.data) {
						//TODO: ouioui pas bon passwd
						alert("Wrong password");
					} else setCanIBebouPlz(true);
				})
				.catch((err) => {
					console.log(err);
				});
		} else setCanIBebouPlz(true);
	}, [joinChannel, setChannel, user.login]);

	useEffect(() => {
		if (!canIBebouPlz) return;
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/toxic-relations/membership`,
				{
					chanName: joinChannel.name,
					userLogin: user.login,
					isAdmin: false,
				}
			)
			.then((joined_channel) => {
				setChannel(joined_channel.data.channelName);
			})
			.then(() => {
				setCanIBebouPlz(false);
				socket.emit("membershipUpdate", {
					channel: joinChannel.name,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}, [canIBebouPlz]);

	const createChannel = () => {
		setChannelCreation(!channelCreation);
	};

	return (
		<>
			{channelCreation ? (
				<>
					<button onClick={createChannel}>Return to channel list</button>
					<CreateChannelForm setChannel={setChannel} />
				</>
			) : (
				<>
					{channels.map((channel, i) => (
						<div
						className={style.profilmp}
						key={i}
						onClick={() => setJoinChannel(channel)}
						>
												<div className={style.imgChannel}> {channel.name[0]}</div>
												<div className={style.description}>
													<p className={style.mpname}>{channel.name} {channel.password ? "🔒" : <></>}</p>
													<p className={style.object}>{channel.password ? "A password is requiered for this channel" : "This is an public Channel"}</p>
												</div>
											</div>
						))}
						<button onClick={createChannel}>Create channel</button>
				</>
			)}
		</>
	);
};

export default AddChannelMenu;
