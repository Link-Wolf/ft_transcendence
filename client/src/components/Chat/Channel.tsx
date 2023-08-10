import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";
import Message from "./Message";

const Channel = ({
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
	}, [update, channel, user.login]);

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
	}, [update, channel]);

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
	}, [messages, relations, user.login]);

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
	}, [relations, user.login, avatars]);

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
					console.log(err);
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

export default Channel;
