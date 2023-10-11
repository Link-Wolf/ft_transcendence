import axios from "axios";
import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import CreateChannelForm from "./CreateChannelForm";
import socket from "../../socket";
import style from "../../style/Chat.module.scss";
import { useNotifications } from "../Notifications";
import { usePrompt } from "../Prompt";

const AddChannelMenu = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * Add channel menu, either create a channel or join one
	 */
	const [channels, setChannels] = useState<any[]>([]);
	const [channelCreation, setChannelCreation] = useState(false);
	const user = useContext(UserContext);
	const notifications = useNotifications();
	const prompt = usePrompt();

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

	const checkPassword = async (channel: any): Promise<boolean> => {
		if (channel.password !== "yesyesno") return true;
		const password = await prompt.password("Password");
		if (!password) return false;

		return await axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channel.name}/passwd`,
				{
					password: password,
					userLogin: user.login,
				}
			)
			.then((response) => {
				if (!response.data) {
					notifications.error("Error", "Wrong Password");
					return false;
				} else return true;
			})
			.catch((err) => {
				console.log(err);
				return false;
			});
	};

	const joinChannel = async (channel: any) => {
		if (!(await checkPassword(channel))) return;

		await axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/toxic-relations/membership`,
				{
					chanName: channel.name,
					userLogin: user.login,
					isAdmin: false,
				}
			)
			.then((joined_channel) => {
				setChannel(joined_channel.data.channelName);
			})
			.then(() => {
				notifications.info(
					"Channel joined",
					"Please respect other player"
				);
				socket.emit("membershipUpdate", {
					channel: channel.name,
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const createChannel = () => {
		setChannelCreation(!channelCreation);
	};

	return (
		<>
			{channelCreation ? (
				<>
					{/* <p className={style.createbutton}onClick={createChannel}>^</p> */}
					<CreateChannelForm setChannel={setChannel} />
				</>
			) : (
				<>
					<div className={style.mpscroll}>
						{/* <p className={style.createbutton} onClick={createChannel}>+</p> */}
						<div className={style.profilmp} onClick={createChannel}>
							{/* <div className={style.imgChannel}>+</div> */}
							<div className={style.description}>
								<p className={style.mpname}>
									Create your own channel
								</p>
								<p className={style.object}>
									Begin a new discussion
								</p>
							</div>
						</div>
						{channels.map((channel, i) => (
							<div
								className={style.profilmp}
								key={i}
								onClick={() => joinChannel(channel)}
							>
								<div className={style.imgChannel}>+</div>
								<div className={style.description}>
									<p className={style.mpname}>
										{channel.name}{" "}
										{channel.password ? "🔒" : <></>}
									</p>
									<p className={style.object}>
										{channel.password
											? "A password is requiered for this channel"
											: "This is an public Channel"}
									</p>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</>
	);
};

export default AddChannelMenu;
