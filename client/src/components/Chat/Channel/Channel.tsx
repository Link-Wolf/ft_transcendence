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

	const [update, setUpdate] = useState(true); //TODO: split that bad boy into multiple update states

	const [owner, setOwner] = useState("");
	const [admins, setAdmins] = useState<string[]>([]);
	const [members, setMembers] = useState<any>({});

	const [showThingsAboutChannel, setShowThingsAboutChannel] = useState("");

	//	Listen to the server for new messages
	useEffect(() => {
		function clic(payload: String) {
			if (payload === channel) setUpdate(true);
		}
		socket.on("youGotMail", clic);
		return () => {
			socket.off("youGotMail", clic);
		};
	}, [channel]);

	// Load the owner of the channel
	useEffect(() => {
		if (channel[0] === "_") return;
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
	}, [channel]);

	//  Load the admins of the channel
	useEffect(() => {
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
		setUpdate(false);
	}, [channel]);

	//Load the members from the server and their relations with the user
	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/toxic-relations/user/${user.login}/channel/${channel}`
			)
			.then((res) => {
				setMembers(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
		setUpdate(false);
	}, [channel, update, user]);

	const toggleBlock = (login: string) => {
		if (members[login].isBlocked) {
			unblockSomeone(login);
		} else {
			blockSomeone(login);
		}
	};

	const unblockSomeone = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${user.login}/${login}`
			)
			.then(() => {
				socket.emit("newMessageDaddy", {
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const blockSomeone = (login: string) => {
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block`,
				{
					userLogin: user.login,
					blocked: login,
				}
			)
			.then(() => {
				socket.emit("newMessageDaddy", {
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const toggleFriendship = (login: string) => {
		if (members[login].isFriend) {
			unfriendSomeone(login);
			setMembers((members: any) => {
				return {
					...members,
					[login]: {
						...members[login],
						isFriend: false,
					},
				};
			});
		} else {
			setMembers((members: any) => {
				return {
					...members,
					[login]: {
						...members[login],
						isFriend: true,
					},
				};
			});
		}
	};

	const unfriendSomeone = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/friendship/${user.login}/${login}`
			)
			.catch((err) => {
				console.log(err);
			});
	};

	const friendSomeone = async (login: string) => {
		let block = await axios.get(
			`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
		);
		if (block.data.length !== 0) {
			//TODO: cancel friendship request (front-end side) because the target blocked the user
			console.log(
				`${login} blocked ${user.login}, so no u can't be friend with him !`
			);
		}
		console.log(`${user.login} wants to be friend with ${login}`); //TODO: implement friendship request
	};

	const askForGame = () => {
		//TODO: ask the other person for game
	};

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
					{Object.keys(members).map((login, i) => (
						<div key={i}>
							<ChannelUser
								channel={channel}
								admins={admins}
								owner={owner}
								login={login}
								members={members}
								askForGame={askForGame}
								toggleFriendship={toggleFriendship}
								toggleBlock={toggleBlock}
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
					toggleBlock={toggleBlock}
					toggleFriendship={toggleFriendship}
					askForGame={askForGame}
					admins={admins}
					owner={owner}
				/>
			)}
		</div>
	);
};

export default Channel;
