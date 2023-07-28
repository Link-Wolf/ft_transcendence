import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios";
import { UserContext } from "../App";
import { Link } from "react-router-dom";
import style from "../style/Chat.module.scss";

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
	const [channel, setChannel] = useState<String | null>(null);
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
				<ChannelList setChannel={setChannel} />
			) : !showList ? (
				<ChatWindow
					channel={channel}
					toggleShowlist={toggleShowlist}
					setChannel={setChannel}
				/>
			) : (
				<UserList channel={channel} toggleShowlist={toggleShowlist} />
			)}
		</div>
	);
};

const ChannelCreation = ({ setChannel }: { setChannel: Function }) => {
	//TODO: better working because arborescence tout ca
	//et TODO: tant que tu passes par la y a les trucs de genre quand tu creer
	//un channel et que ca back ca affiche pas dans la liste le nouveau channel
	//genre faut refresh le composant tout ca..
	const user = useContext(UserContext);
	const [isChannel, setNewChannel] = useState(false);
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

const UserList = ({
	channel,
	toggleShowlist,
}: {
	channel: String;
	toggleShowlist: Function;
}) => {
	const [users, setUsers] = useState<String[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/channel/${channel}`
			)
			.then((res) => {
				setUsers(
					res.data.map((membership: any) => membership.userLogin)
				);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<div>
			<button onClick={() => toggleShowlist()}>Back</button>
			<h1>User List</h1>
			{users.length ? (
				users.map((user, i) => (
					<div key={i}>
						<Link to={`/profile/${user}`}>{user}</Link>
					</div>
				))
			) : (
				<div>
					Tu n'as pas encore de conversations privées bebou sucre
				</div>
			)}
		</div>
	);
};

const ChatWindow = ({
	channel,
	toggleShowlist,
	setChannel,
}: {
	channel: String;
	toggleShowlist: Function;
	setChannel: Function;
}) => {
	const user = useContext(UserContext);
	const [messages, setMessages] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);
	const [message, setMessage] = useState("");
	const [isBlocked, setIsBlocked] = useState(false);

	const [relations, setRelations] = useState<any>({});

	/**
	 *	@brief	Listen to the server for new messages
	 */
	useEffect(() => {
		function clic(payload: String) {
			if (payload === channel) setUpdate(true);
		}
		socket.on("youGotMail", clic);
		return () => {
			socket.off("youGotMail", clic);
		};
	}, []);

	/**
	 *	@brief	Load the messages from the server and add the users
	 *		to the relations
	 */
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
				for (let message of res.data) {
					if (message.userLogin === user.login) continue;
					if (message.userLogin in relations) continue;
					setRelations({
						...relations,
						[message.userLogin]: {
							isBlocked: undefined,
							isFriend: undefined,
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
							`/api/block/by/${user.login}`
					)
					.then((res) => {
						for (let block of res.data) {
							if (block.blockedLogin in relations) {
								setRelations({
									...relations,
									[block.blockedLogin]: {
										...relations[block.blockedLogin],
										isBlocked: true,
									},
								});
							}
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
									if (friend.userLogin in relations) {
										setRelations({
											...relations,
											[friend.userLogin]: {
												...relations[friend.userLogin],
												isFriend: true,
											},
										});
									}
								}
							})
							.catch((err) => {
								console.log(err);
							});
					})
					.catch((err) => {
						console.log(err);
					});
			})
			.catch((err) => {
				console.log(err);
			});
		setUpdate(false);
	}, [update]);

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

	return (
		<div>
			<button onClick={() => setChannel(null)}>Back</button>
			<button
				onClick={() => {
					toggleShowlist();
				}}
			>
				User List
			</button>
			<h1>{channel}</h1>
			{messages.map((message, i) => (
				<div key={i}>
					<Message
						login={message.userLogin}
						date={message.createdAt}
						content={message.content}
						relation={
							message.userLogin === user.login
								? { isBlocked: false, isFriend: false }
								: relations[message.userLogin]
						}
						toggleBlock={toggleBlock}
						toggleFriendship={toggleFriendship}
					/>
				</div>
			))}
			<input
				value={message}
				type='text'
				placeholder='message'
				onChange={(e) => {
					setMessage(e.target.value);
				}}
			/>
			<button
				onClick={async () => {
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
								console.log(err);
							});
				}}
			>
				send message
			</button>
		</div>
	);
};

const Message = ({
	login,
	date,
	content,
	relation,
	toggleBlock,
	toggleFriendship,
}: {
	login: String;
	date: String;
	content: String;
	relation: { isBlocked: boolean; isFriend: boolean };
	toggleBlock: Function;
	toggleFriendship: Function;
}) => {
	const [isToggleBox, setIsToggleBox] = useState(false);
	const user = useContext(UserContext);

	const toggleBox = async () => {
		if (login == user.login) return; //TODO: redirect him to its profile maybe ?
		setIsToggleBox(!isToggleBox);
	};

	const askForGame = () => {
		//TODO: ask the other person for game
		toggleBox();
	};

	if (!relation) return <>loading...</>;
	return (
		<>
			<button onClick={toggleBox}>
				{login} {relation.isBlocked ? "(bloqué)" : ""}
			</button>
			{isToggleBox && (
				<div>
					<Link to={`/profile/${login}`}>
						<label>Profil</label>
					</Link>
					<button onClick={askForGame}>Faire une partie</button>
					<button
						onClick={() => {
							toggleFriendship(login);
						}}
					>
						{relation.isFriend
							? "Supprimer l'ami"
							: "Demander en ami"}
					</button>
					<button
						onClick={() => {
							toggleBlock(login);
						}}
					>
						{relation.isBlocked ? "Débloquer" : "Bloquer"}
					</button>
				</div>
			)}
			<label>{date}</label>
			<p>{relation.isBlocked ? "Ce message est masquée" : content}</p>
		</>
	);
};

export default Chat;
