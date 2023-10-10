import { useState, useContext, useEffect } from "react";
import axios from "axios";
import Channel from "./Channel/Channel";
import { UserContext } from "../../App";
import AddChannelMenu from "./AddChannelMenu";
import style from "../../style/Chat.module.scss";
import socket from "../../socket";
import { PPDisplayer } from "../ImageDisplayer";

const ChatHomePage = ({ setChannel }: { setChannel: Function }) => {
	const context = useContext(UserContext);
	/**
	 * List of channels, either display the list of channels the user is in, or the menu to join/create a channel
	 */
	const [channels, setChannels] = useState<String[]>([]);
	const [newChannelVisibility, setNewChannelVisibility] = useState(false);
	const [update, setUpdate] = useState(true);

	/**
	 * List of DMs, either display the list of DMs the user is in, or the menu to create a DM
	 */
	const [memberships, setMemberships] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [selectedUser, setSelectedUser] = useState("");
	const [, setNewDMError] = useState("");

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/dm/${context.login}`
			)
			.then((response) => {
				//get all memberships from dm channels with current user
				let memberships = response.data.map((channel: any) => {
					return channel.memberships.filter(
						(membership: any) =>
							membership.userLogin !== context.login
					)[0];
				});
				setMemberships(memberships);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [context.login]);

	useEffect(() => {
		//get all friends that haven't dm yet
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/private-message/${context.login}`
			)
			.then((response) => {
				setUsers(response.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [context.login]);

	const openDM = async () => {
		if (
			!selectedUser ||
			selectedUser === undefined ||
			!users.some((user) => user.login === selectedUser)
		) {
			setNewDMError(
				"Not a valid user, login not existing or user blocked you"
			);
			return;
		}

		let dmChannelName = `_${[context.login, selectedUser].sort()[0]}&${
			[context.login, selectedUser].sort()[1]
		}`;

		// -check if dm channel already exists
		if (
			!memberships.some(
				(membership) => membership.channelName === dmChannelName
			)
		) {
			//create the dm channel
			await axios
				.post(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/private-message`,
					{
						loginOther: selectedUser,
					}
				)
				.then((response) => {
					setChannel(response.data.name);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			setChannel(dmChannelName);
		}
	};

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
		<>
			{/* <div className={style.channelList}>
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
							<div>You didn't join any channel yet</div>
							)}
				</>
			)}
		</div>

		<div className={style.mplist}>
			<h1>DM List</h1>
			{newDMError !== "" && <div>{newDMError}</div>}

			<div className={style.displaylist}>
			{memberships.length ? (
				memberships.map((membership, i) => (
					<div
					className={style.profilmp}
					key={i}
					onClick={() => setChannel(membership.channelName)}
					>
						<PPDisplayer
							size={80}
							login={membership.userLogin}
							status={true}
							/>
						<button className={style.mpname}>{membership.userLogin}</button>
					</div>
				))
				) : (
				<>
					<p>
						You don't have any DM<br/>
						Start one from another user's profile, from a channel or here
					</p>
				</>
			)}
			</div>
					<div>
						<datalist id='new_dm_list'>
							{users.map((user, i) => (
								<option key={i} value={user.login} />
							))}
						</datalist>
						<input className={style.mpinput}
							placeholder="Enter user's login"
							list='new_dm_list'
							onChange={(e) => setSelectedUser(e.target.value)}
						/>
						<button
							disabled={!selectedUser || selectedUser === ""}
							onClick={openDM}
						>
							Go to conv
						</button>
					</div>
		</div> */}

			<div className={style.ChatHomePage}>
				{newChannelVisibility ? (
					<>
						<div className={style.headsection}>
							<p
								onClick={addChannel}
								className={style.actionbutton}
							>
								{newChannelVisibility ? (
									<>&lsaquo;</>
								) : (
									<>Modify</>
								)}
							</p>
							<h2 className={style.titleNew}>New conversation</h2>
						</div>
						<div className={style.search}>
							<button
								className={style.searchbutton}
								disabled={!selectedUser || selectedUser === ""}
								onClick={openDM}
							>
								🔎
							</button>
							<input
								className={style.input}
								placeholder="Enter friend's login for start a new conversation"
								list='new_dm_list'
								onChange={(e) =>
									setSelectedUser(e.target.value)
								}
							/>
						</div>
						<AddChannelMenu setChannel={setChannel} />
					</>
				) : (
					<>
						<div className={style.headsection}>
							<h2 className={style.titleMessage}>Message</h2>
							<p className={style.addbutton} onClick={addChannel}>
								{newChannelVisibility ? <>&gt;</> : <>+</>}
							</p>
						</div>
						<div className={style.mplist}>
							<div className={style.search}>
								<button
									className={style.searchbutton}
									disabled={
										!selectedUser || selectedUser === ""
									}
									onClick={openDM}
								>
									🔎
								</button>
								<input
									className={style.input}
									placeholder="Enter friend's login for start a new conversation"
									list='new_dm_list'
									onChange={(e) =>
										setSelectedUser(e.target.value)
									}
								/>
							</div>
							<div className={style.mpscroll}>
								{channels.map((channel, i) => (
									<div
										className={style.profilmp}
										key={i}
										onClick={() => setChannel(channel)}
									>
										<div className={style.imgChannel}>
											{" "}
											{channel.toUpperCase()[0]}
										</div>
										<div className={style.description}>
											<p className={style.mpname}>
												{channel}
											</p>
											<p className={style.object}>
												Join the channel {channel}
											</p>
										</div>
									</div>
								))}
								{memberships.map((membership, i) => (
									<div
										className={style.profilmp}
										key={i}
										onClick={() =>
											setChannel(membership.channelName)
										}
									>
										<PPDisplayer
											size={50}
											login={membership.userLogin}
											status={true}
										/>
										<div className={style.description}>
											<p className={style.mpname}>
												{membership.userLogin}
											</p>
											<p className={style.object}>
												Talk to {membership.userLogin},
												but DON'T PANIC !
											</p>
										</div>
									</div>
								))}
								{channels.length === 0 &&
									memberships.length === 0 && (
										<>
											<p className={style.empty}>
												{" "}
												Any conversation yet, you can
												create add and create channel
												with "+"
											</p>
											{/* <img className={style.imgChat} src="https://temtem.wiki.gg/images/b/bb/Platox_idle_animation.gif"></img> */}
										</>
									)}
							</div>
						</div>
					</>
				)}
			</div>
		</>
	);
};

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	/**
	 * Chatbox component, either call the current Channel component, or list the channels the user is in (both channels and dms)
	 */
	const user = useContext(UserContext);

	return (
		<div className={style.chatbox}>
			<div className={style.top}>
				<p className={style.cam}>O o</p>
				<button
					className={style.toggleChat}
					onClick={() => toggleChat()}
				>
					X
				</button>
			</div>
			{!user.channel ? (
				<>
					<ChatHomePage setChannel={user.setChannel} />
					{/* <ChannelList2 setChannel={user.setChannel} />
					<MPList2 setChannel={user.setChannel} /> */}
				</>
			) : (
				<Channel channel={user.channel} setChannel={user.setChannel} />
			)}
		</div>
	);
};

export default ChatBox;
