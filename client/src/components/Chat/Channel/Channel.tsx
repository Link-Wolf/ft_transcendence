import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../App";
import socket from "../../../socket";
import { PPDisplayer } from "../../ImageDisplayer";
import MessagesManager from "./MessagesManager";
import ChannelUser from "./ChannelUser";
import ChannelSettings from "./ChannelSettings";
import { UnbanButton } from "../../ActionsButtons";
import style from "../../../style/Chat.module.scss";

const Channel = ({
	channel,
	setChannel,
}: {
	channel: string;
	setChannel: Function;
}) => {
	/**
	 * Channel component itself, display the messages and the input to send messages, and handle the messages
	 */
	const user = useContext(UserContext);

	const [membersUpdate, setMembersUpdate] = useState(true);
	const [adminsUpdate, setAdminsUpdate] = useState(true);

	const [owner, setOwner] = useState(undefined as any);
	const [admins, setAdmins] = useState<any[]>([]);
	const [members, setMembers] = useState<any>({});

	const [updateLebany, setUpdateLebany] = useState(true);
	const [lebany, setLebany] = useState<string[]>([]);

	const [showThingsAboutChannel, setShowThingsAboutChannel] = useState("");
	const [showLebany, setShowLebany] = useState(false);

	//	Listen to the server for new messages
	useEffect(() => {
		const relationUpdate = (payload: any) => {
			if (payload.userA === user.login || payload.userB === user.login)
				setMembersUpdate(true);
		};

		const membershipUpdate = (payload: any) => {
			if (payload.channel === channel) {
				if (payload.what === "kick" && payload.who === user.login) {
					setChannel(null);
					return;
				}
				if (payload.what === "ban" && payload.who === user.login) {
					setChannel(null);
					return;
				}
				setMembersUpdate(true);
				setAdminsUpdate(true);
				setUpdateLebany(true);
			}
		};

		socket.on("relationUpdate", relationUpdate);
		socket.on("membershipUpdate", membershipUpdate);

		return () => {
			socket.off("relationUpdate", relationUpdate);
			socket.off("membershipUpdate", membershipUpdate);
		};
	}, []);

	useEffect(() => {
		if (
			!updateLebany ||
			(owner.login !== user.login &&
				!admins.some((admin) => admin.login === user.login))
		)
			return;
		if (channel[0] === "_") return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/ban/channel/${channel}`
			)
			.then((res) => {
				setLebany(res.data.map((ban: any) => ban.userLogin));
				setUpdateLebany(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [updateLebany, admins, owner, channel, user.login]);

	// Load the owner of the channel
	useEffect(() => {
		if (!adminsUpdate) return;
		if (channel[0] === "_") return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channel}`
			)
			.then((res) => {
				setOwner(res.data.owner);
			})
			.catch((err) => {
				console.log(err);
			});
		setAdminsUpdate(false);
	}, [channel, admins, adminsUpdate]);

	//  Load the admins of the channel
	useEffect(() => {
		if (!adminsUpdate) return;
		if (channel[0] === "_") return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/channel/${channel}/admins`
			)
			.then((res) => {
				setAdmins(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
		setAdminsUpdate(false);
	}, [channel, adminsUpdate]);

	//Load the members from the server and their relations with the user
	useEffect(() => {
		if (!membersUpdate) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/toxic-relations/user/${user.login}/channel/${channel}`
			)
			.then((res) => {
				setMembers(res.data);
				if (!res.data[user.login] || !res.data[user.login].isMember)
					//If i got kick. i go back to the home page
					setChannel(null);
			})
			.catch((err) => {
				console.log(err);
			});
		setMembersUpdate(false);
	}, [channel, membersUpdate, user, setChannel]);

	if (!owner) {
		setOwner({ login: "" });
		return <></>;
	}

	return (
		// <div>
		// 	<button onClick={() => setChannel(null)}>Back</button>
		// 	{channel[0] !== "_" && (
		// 		<>
		// 			<button
		// 				onClick={() =>
		// 					showThingsAboutChannel === "userList"
		// 						? setShowThingsAboutChannel("")
		// 						: setShowThingsAboutChannel("userList")
		// 				}
		// 			>
		// 				{showThingsAboutChannel === "userList"
		// 					? "X"
		// 					: "User List"}
		// 			</button>
		// 			{owner.login === user.login && (
		// 				<button
		// 					onClick={() =>
		// 						showThingsAboutChannel === "channelSettings"
		// 							? setShowThingsAboutChannel("")
		// 							: setShowThingsAboutChannel(
		// 									"channelSettings"
		// 							  )
		// 					}
		// 				>
		// 					{showThingsAboutChannel === "channelSettings"
		// 						? "X"
		// 						: "Channel Settings"}
		// 				</button>
		// 			)}
		// 		</>
		// 	)}
		// 	{showThingsAboutChannel === "userList" ? (
		// 		<>
		// 			{/* if usr is an admin or the owner, have a button to see ban members */}
		// 			{(admins.includes(user.login) ||
		// 				owner.login === user.login) && (
		// 				<button
		// 					onClick={() => {
		// 						if (showLebany) setUpdateLebany(true);
		// 						setShowLebany(!showLebany);
		// 					}}
		// 				>
		// 					{!showLebany
		// 						? "See the goulagged"
		// 						: "Back to user list"}
		// 				</button>
		// 			)}
		// 			{!showLebany
		// 				? Object.keys(members)
		// 						.map((login) => members[login])
		// 						.filter((member) => {
		// 							return member.isMember;
		// 						})
		// 						.map((member, i) => (
		// 							<div key={i}>
		// 								<ChannelUser
		// 									name={member.user.name}
		// 									channel={channel}
		// 									admins={admins}
		// 									owner={owner}
		// 									login={member.user.login}
		// 									members={members}
		// 									setChannel={setChannel}
		// 								/>
		// 							</div>
		// 						))
		// 				: lebany.length
		// 				? lebany.map((login, i) => (
		// 						<div key={i}>
		// 							<PPDisplayer
		// 								login={login}
		// 								status={true}
		// 								size={30}
		// 							/>
		// 							{login}
		// 							<UnbanButton
		// 								login={login}
		// 								channel={channel}
		// 							/>
		// 						</div>
		// 				  ))
		// 				: "No one is goulagged yet sir"}
		// 		</>
		// 	) : showThingsAboutChannel === "channelSettings" &&
		// 	  owner.login === user.login ? (
		// 		<ChannelSettings
		// 			channelName={channel}
		// 			owner={owner}
		// 			admins={admins}
		// 		/>
		// 	) : (
		// 		<MessagesManager
		// 			channel={channel}
		// 			members={members}
		// 			admins={admins}
		// 			owner={owner}
		// 			setChannel={setChannel}
		// 		/>
		// 	)}
		// </div>
		<div>
			<div className={style.headsection}>
				<p
					className={style.actionbutton}
					onClick={() => setChannel(null)}
				>
					&lsaquo;
				</p>
				{channel[0] !== "_" ? (
					<h2 className={style.titleChannel}>Channel</h2>
				) : (
					<h2 className={style.titlePrivate}>Private Message</h2>
				)}
				{channel[0] !== "_" && (
					<>
						{showThingsAboutChannel === "channelSettings" ? (
							<p className={style.listbutton}>
								&nbsp;&nbsp;&nbsp;&nbsp;
							</p>
						) : (
							<></>
						)}
						{owner.login === user.login ? (
							showThingsAboutChannel !== "userList" ? (
								<p
									className={style.parambutton}
									onClick={() =>
										showThingsAboutChannel ===
										"channelSettings"
											? setShowThingsAboutChannel("")
											: setShowThingsAboutChannel(
													"channelSettings"
											  )
									}
								>
									{showThingsAboutChannel ===
									"channelSettings"
										? "↩️"
										: "🛡️"}
								</p>
							) : (
								<p
									className={style.parambutton}
									onClick={() => {
										if (showLebany) setUpdateLebany(true);
										setShowLebany(!showLebany);
									}}
								>
									{!showLebany ? "📛" : "👥"}
								</p>
							)
						) : (
							<p className={style.parambutton}>
								&nbsp;&nbsp;&nbsp;
							</p>
						)}
						{showThingsAboutChannel === "channelSettings" ? (
							<></>
						) : (
							<p
								className={style.listbutton}
								onClick={() =>
									showThingsAboutChannel === "userList"
										? setShowThingsAboutChannel("")
										: setShowThingsAboutChannel("userList")
								}
							>
								{showThingsAboutChannel === "userList"
									? "↩️"
									: "👥"}
							</p>
						)}
					</>
				)}
			</div>
			{showThingsAboutChannel === "userList" ? (
				<>
					{!showLebany ? (
						<h2 className={style.channelName}> User List</h2>
					) : (
						<h2 className={style.channelName}>Ban List</h2>
					)}
					{/* if usr is an admin or the owner, have a button to see ban members */}
					{/* {(admins.includes(user.login) ||
						owner.login === user.login) && (
						<button
							onClick={() => {
								if (showLebany) setUpdateLebany(true);
								setShowLebany(!showLebany);
							}}
							>
							{!showLebany
								? "See the banlist"
								: "Back to user list"}
						</button>
					)} */}
					<div className={style.mpscroll}>
						{!showLebany ? (
							Object.keys(members)
								.map((login) => members[login])
								.filter((member) => {
									return member.isMember;
								})
								.map((member, i) => (
									<div key={i}>
										<ChannelUser
											name={member.user.name}
											channel={channel}
											admins={admins}
											owner={owner}
											login={member.user.login}
											members={members}
											setChannel={setChannel}
										/>
									</div>
								))
						) : lebany.length ? (
							lebany.map((login, i) => (
								<div className={style.profilmp} key={i}>
									<PPDisplayer
										size={50}
										login={login}
										status={true}
									/>
									<div className={style.description}>
										<p className={style.mpname}>{login}</p>
										<p className={style.object}>
											<UnbanButton
												login={login}
												channel={channel}
											/>
										</p>
									</div>
								</div>
							))
						) : (
							<p className={style.empty}>
								{" "}
								Anyone is ban yet, I think is a good thing
							</p>
						)}
					</div>
				</>
			) : showThingsAboutChannel === "channelSettings" &&
			  owner.login === user.login ? (
				<>
					<h2 className={style.channelName}>
						{" "}
						Administrator section
					</h2>
					<div className={style.mpscroll}>
						<ChannelSettings
							channelName={channel}
							owner={owner}
							admins={admins}
						/>
					</div>
				</>
			) : (
				<MessagesManager
					channel={channel}
					members={members}
					admins={admins}
					owner={owner}
					setChannel={setChannel}
				/>
			)}
		</div>
	);
};

export default Channel;
