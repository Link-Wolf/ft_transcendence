import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
import { UserContext } from "../App";
import { Link, redirect } from "react-router-dom";
import style from "../style/Chat.module.scss";
import { use } from "matter-js";
import { PPDisplayer } from "./ImageDisplayer";

const Chat = () => {
	const [chat, setChat] = useState(false);
	const user = useContext(UserContext);

	const toggleChat = () => {
		setChat(!chat);
	};

	if (!user.clearance || user.clearance === 0) return <></>;

	return (
		<div className={style.chat}>
			{chat ? (
				<ChatBox toggleChat={toggleChat} />
			) : (
				<button className={style.toggleChat} onClick={toggleChat}>
					Toggle Chat
				</button>
			)}
		</div>
	);
};

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	const [channel, setChannel] = useState<string | null>(null);
	const [showList, setShowList] = useState(false);

	const toggleShowlist = () => {
		setShowList(!showList);
	};

	return (
		<div className={style.chatbox}>
			<button className={style.toggleChat} onClick={() => toggleChat()}>
				Close Chat
			</button>
			{!channel ? (
				<>
					<ChannelList setChannel={setChannel} />
					<UserList setChannel={setChannel} />
				</>
			) : (
				<ChatWindow
					channel={channel}
					toggleShowlist={toggleShowlist}
					setChannel={setChannel}
				/>
			)}
		</div>
	);
};

const ChannelCreation = ({ setChannel }: { setChannel: Function }) => {
	const user = useContext(UserContext);
	const [showList, setShowList] = useState(false);
	const [data, setData] = useState({ name: "", pass: "" });

	const handleFormChange = (e: any) => {
		setData({ ...data, [e.target.id]: e.target.value });
	};

	const toggleShowlist = () => {
		setShowList(!showList);
	};

	const createChannel = async () => {
		await axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel`,
				{
					userLogin: user.login,
					name: data.name,
					password: data.pass,
				}
			)
			.then(async (response) => {
				try {
					const created_channel = await axios.post(
						`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership`,
						{
							chanName: response.data.name,
							userLogin: user.login,
							isAdmin: true,
						}
					);
					setChannel(created_channel.data.channelName);
				} catch (error) {
					console.log(error);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<form>
			<label>Nom du channel</label>
			<input
				id='name'
				type='text'
				value={data.name}
				onChange={handleFormChange}
			/>
			<label>Mot de passe (optionnel)</label>
			<input
				id='pass'
				type='password'
				value={data.pass}
				onChange={handleFormChange}
			/>
			<button type='button' onClick={createChannel}>
				Creer
			</button>
		</form>
	);
};

const NewChannel = ({ setChannel }: { setChannel: Function }) => {
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
	}, [joinChannel]);

	const createChannel = () => {
		setChannelCreation(!channelCreation);
	};

	return (
		<>
			{channelCreation ? (
				<>
					<button onClick={createChannel}>Annuler</button>
					<ChannelCreation setChannel={setChannel} />
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
				<NewChannel setChannel={setChannel} />
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

const UserList = ({ setChannel }: { setChannel: Function }) => {
	const [memberships, setMemberships] = useState<any[]>([]);
	const context = useContext(UserContext);

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
				console.log(memberships);
				setMemberships(memberships);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<div>
			<h1>DM List</h1>
			{memberships.map((membership, i) => (
				<div key={i} onClick={() => setChannel(membership.channelName)}>
					<PPDisplayer size={100} login={membership.userLogin} />
					{membership.userLogin}
				</div>
			))}
		</div>
	);
};

const ChatWindow = ({
	channel,
	toggleShowlist,
	setChannel,
}: {
	channel: string;
	toggleShowlist: Function;
	setChannel: Function;
}) => {
	const user = useContext(UserContext);
	const [messages, setMessages] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);
	const [message, setMessage] = useState("");
	const [relations, setRelations] = useState<any>({});
	const [avatars, setAvatars] = useState<any>({});
	const [canSendMessage, setCanSendMessage] = useState(false);

	useEffect(() => {
		if (channel[0] === "_") {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}` +
						`://${process.env.REACT_APP_HOSTNAME}` +
						`:${process.env.REACT_APP_BACKEND_PORT}` +
						`/api/block/of/${user.login}`
				)
				.then((res) => {
					setCanSendMessage(
						!res.data.some(
							(blocker: any) =>
								blocker.blockerLogin ===
									channel.slice(1).split("&")[0] ||
								blocker.blockerLogin ===
									channel.slice(1).split("&")[1]
						)
					);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}` +
						`://${process.env.REACT_APP_HOSTNAME}` +
						`:${process.env.REACT_APP_BACKEND_PORT}` +
						`/api/mute/user/${user.login}/channel/${channel}`
				)
				.then((res) => {
					setCanSendMessage(res.data.length === 0);
				})
				.catch((err) => {
					console.log(err);
				});
		}
		setUpdate(false);
	}, [update]);

	//	Listen to the server for new messages
	useEffect(() => {
		function clic(payload: String) {
			if (payload === channel) setUpdate(true);
		}
		socket.on("youGotMail", clic);
		return () => {
			socket.off("youGotMail", clic);
		};
	}, []);

	//	Load the messages from the server
	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/message/channel/${channel}`
			)
			.then((res) => {
				setMessages(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
		setUpdate(false);
	}, [update]);

	//Load the relations from the server
	useEffect(() => {
		for (let message of messages) {
			if (message.userLogin === user.login) continue;
			if (message.userLogin in relations) continue;
			setRelations({
				...relations,
				[message.userLogin]: {
					isBlocked: false,
					isFriend: false,
				},
			});
		}
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/block/by/${user.login}`
			)
			.then((res) => {
				let blocked = {};
				for (let block of res.data) {
					setRelations({
						...relations,
						[block.blockedLogin]: {
							...relations[block.blockedLogin],
							isBlocked: true,
						},
					});
				}
			})
			.then(() => {
				axios
					.get(
						`${process.env.REACT_APP_PROTOCOL}` +
							`://${process.env.REACT_APP_HOSTNAME}` +
							`:${process.env.REACT_APP_BACKEND_PORT}` +
							`/api/friendship/${user.login}`
					)
					.then((res) => {
						for (let friend of res.data) {
							setRelations({
								...relations,
								[friend.userLogin]: {
									...relations[friend.userLogin],
									isFriend: true,
								},
							});
						}
					})
					.catch((err) => {
						console.log(err);
					});
			})
			.catch((err) => {
				console.log(err);
			});
	}, [messages]);

	useEffect(() => {
		for (let login in { ...relations, [user.login]: {} }) {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}` +
						`://${process.env.REACT_APP_HOSTNAME}` +
						`:${process.env.REACT_APP_BACKEND_PORT}` +
						`/api/user/${login}`
				)
				.then((res) => {
					setAvatars({
						...avatars,
						[login]: res.data.avatar,
					});
				})
				.catch(() => console.log("error"));
		}
	}, [relations]);

	const toggleBlock = (login: string) => {
		if (relations[login].isBlocked) {
			unblockSomeone(login);
			setRelations({
				...relations,
				[login]: {
					...relations[login],
					isBlocked: false,
				},
			});
		} else {
			blockSomeone(login);
			setRelations({
				...relations,
				[login]: {
					...relations[login],
					isBlocked: true,
				},
			});
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
		if (relations[login].isFriend) {
			unfriendSomeone(login);
			setRelations({
				...relations,
				[login]: {
					...relations[login],
					isFriend: false,
				},
			});
		} else {
			friendSomeone(login);
			setRelations({
				...relations,
				[login]: {
					...relations[login],
					isFriend: true,
				},
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

	const friendSomeone = (login: string) => {
		console.log(`${user.login} wants to be friend with ${login}`); //TODO: implement friendship request
	};

	const sendMessage = async () => {
		if (!canSendMessage) return;
		let printableRegexButNoSpace = /[!-~]/; // Matches any printable ASCII characters except space
		if (printableRegexButNoSpace.test(message))
			await axios
				.post(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/message`,
					{
						chanName: channel,
						content: message,
						userLogin: user.login,
					}
				)
				.then(() => {
					setMessage("");
					setUpdate(true);
					socket.emit("newMessageDaddy", {
						channel: channel,
					});
				})
				.catch((err) => {
					if (err.response.status === 403) {
						alert("You are blocked from this channel");
					}
					// console.log(err);
				});
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			sendMessage();
		}
	};

	const getNameOfTheOther = (channel: string) => {
		let names = channel.split("_")[1].split("&");
		return names[0] === user.login ? names[1] : names[0];
	};

	return (
		<div>
			<button onClick={() => setChannel(null)}>Back</button>
			{channel[0] !== "_" && (
				<button
					onClick={() => {
						toggleShowlist();
					}}
				>
					User List
				</button>
			)}
			<h1>{channel[0] !== "_" ? channel : getNameOfTheOther(channel)}</h1>
			{messages
				.sort((m1, m2) => {
					return (
						new Date(m1.createdAt).getTime() -
						new Date(m2.createdAt).getTime()
					);
				})
				.map((message, i) => (
					<div key={i}>
						<Message
							login={message.userLogin}
							date={message.createdAt}
							content={message.content}
							relation={
								message.userLogin === user.login
									? {
											isBlocked: false,
											isFriend: false,
									  }
									: relations[message.userLogin]
							}
							avatar={avatars[message.userLogin]}
							toggleBlock={toggleBlock}
							toggleFriendship={toggleFriendship}
						/>
					</div>
				))}
			<input
				value={message}
				type='text'
				placeholder={
					canSendMessage
						? "Type your message here..."
						: "You cannot send messages here"
				}
				disabled={!canSendMessage}
				onChange={(e) => {
					setMessage(e.target.value);
				}}
				onKeyDown={handleKeyPress}
			/>
			<button onClick={sendMessage} disabled={!canSendMessage}>
				Send
			</button>
		</div>
	);
};

const Message = ({
	login,
	date,
	content,
	relation,
	avatar,
	toggleBlock,
	toggleFriendship,
}: {
	login: string;
	date: string;
	content: string;
	relation: { isBlocked: boolean; isFriend: boolean };
	avatar: string;
	toggleBlock: Function;
	toggleFriendship: Function;
}) => {
	const [isToggleBox, setIsToggleBox] = useState(false);
	const user = useContext(UserContext);

	const toggleBox = async () => {
		if (login == user.login) redirect("/me");
		setIsToggleBox(!isToggleBox);
	};

	const askForGame = () => {
		//TODO: ask the other person for game
		toggleBox();
	};

	if (!relation) return <>loading... {login}</>;
	return (
		<>
			<img
				src={`data:image/*;base64,${avatar}`}
				alt='avatar'
				style={{ width: 40, height: 40 }}
			/>
			{user.login !== login ? (
				<button onClick={toggleBox}>
					{login} {relation.isBlocked ? "(bloqué)" : ""}
				</button>
			) : (
				<label>{login}</label>
			)}
			{isToggleBox && (
				<div>
					<Link to={`/profile/${login}`}>
						<label>Profil</label>
					</Link>
					<button onClick={askForGame}>Faire une partie</button>
					<button
						onClick={() => {
							toggleFriendship(login);
							toggleBox();
						}}
					>
						{relation.isFriend
							? "Message privé"
							: "Demander en ami"}
					</button>
					<button
						onClick={() => {
							toggleBlock(login);
							toggleBox();
						}}
					>
						{relation.isBlocked ? "Débloquer" : "Bloquer"}
					</button>
				</div>
			)}
			<label>
				{new Date(date).toLocaleDateString() ===
				new Date().toLocaleDateString()
					? new Date(date).toISOString().slice(11, 16) //if today, get an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) and slice it to only get HH:mm
					: new Date(date)
							.toLocaleString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit",
								day: "2-digit",
								month: "2-digit",
								year: "2-digit",
							})
							.replace(",", "")}
			</label>
			<p>{relation.isBlocked ? "Ce message est masquée" : content}</p>
		</>
	);
};

export default Chat;
