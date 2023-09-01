import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../../App";
import socket from "../../../socket";
import Message from "../Message";
import { PPDisplayer } from "../../ImageDisplayer";
import { Link, redirect } from "react-router-dom";
import MessagesManager from "./MessagesManager";
import ChannelUser from "./ChannelUser";
import ChannelSettings from "./ChannelSettings";
import { UnbanButton } from "../../ActionsButtons";

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

	const [owner, setOwner] = useState("");
	const [admins, setAdmins] = useState<string[]>([]);
	const [members, setMembers] = useState<any>({});

	const [updateLebany, setUpdateLebany] = useState(false);
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
				console.log("membershipUpdate");
				setMembersUpdate(true);
				setAdminsUpdate(true);
			}
		};

		socket.on("relationUpdate", relationUpdate);
		socket.on("membershipUpdate", membershipUpdate);

		return () => {
			socket.off("relationUpdate", relationUpdate);
			socket.off("membershipUpdate", membershipUpdate);
		};
	}, [channel]);

	useEffect(() => {
		if (!updateLebany) return;
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
	}, [updateLebany]);

	// Load the owner of the channel
	useEffect(() => {
		if (!adminsUpdate) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channel}`
			)
			.then((res) => {
				setOwner(res.data.ownerLogin);
			})

			.catch((err) => {
				console.log(err);
			});
		setAdminsUpdate(false);
	}, [channel, admins]);

	//  Load the admins of the channel
	useEffect(() => {
		if (!adminsUpdate) return;
		if (channel[0] === "_") return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/channel/${channel}/admins`
			)
			.then((res) => {
				setAdmins(
					res.data.map((membership: any) => membership.userLogin)
				);
			})
			.catch((err) => {
				console.log(err);
			});
		setAdminsUpdate(false);
	}, [channel, adminsUpdate]);

	//Load the members from the server and their relations with the user
	useEffect(() => {
		if (!membersUpdate) return;
		if (channel[0] === "_") return;
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
	}, [channel, membersUpdate, user]);

	console.log(
		Object.keys(members)
			.map((login) => members[login])
			.filter((member) => {
				return member.isMember;
			})
	);

	return (
		<div>
			<button onClick={() => setChannel(null)}>Back</button>
			{channel[0] !== "_" && (
				<>
					<button
						onClick={() =>
							showThingsAboutChannel === "userList"
								? setShowThingsAboutChannel("")
								: setShowThingsAboutChannel("userList")
						}
					>
						{showThingsAboutChannel === "userList"
							? "X"
							: "User List"}
					</button>
					{owner === user.login && (
						<button
							onClick={() =>
								showThingsAboutChannel === "channelSettings"
									? setShowThingsAboutChannel("")
									: setShowThingsAboutChannel(
											"channelSettings"
									  )
							}
						>
							{showThingsAboutChannel === "channelSettings"
								? "X"
								: "Channel Settings"}
						</button>
					)}
				</>
			)}
			{showThingsAboutChannel === "userList" ? (
				<>
					{/* if usr is an admin or the owner, have a button to see ban members */}
					{(admins.includes(user.login) || owner === user.login) && (
						<button
							onClick={() => {
								if (showLebany) setUpdateLebany(true);
								setShowLebany(!showLebany);
							}}
						>
							{!showLebany ? "Voir Lébany" : "Back to user list"}
						</button>
					)}
					{!showLebany
						? Object.keys(members)
								.map((login) => members[login])
								.filter((member) => {
									return member.isMember;
								})
								.map((member, i) => (
									<div key={i}>
										<ChannelUser
											channel={channel}
											admins={admins}
											owner={owner}
											login={member.user.login}
											members={members}
											setChannel={setChannel}
										/>
									</div>
								))
						: lebany.map((login, i) => (
								<div key={i}>
									<PPDisplayer
										login={login}
										status={true}
										size={30}
									/>
									{login}
									<UnbanButton
										login={login}
										channel={channel}
									/>
								</div>
						  ))}
				</>
			) : showThingsAboutChannel === "channelSettings" &&
			  owner === user.login ? (
				<ChannelSettings
					channelName={channel}
					owner={owner}
					admins={admins}
				/>
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
