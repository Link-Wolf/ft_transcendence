import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";
import Message from "./Message";
import { PPDisplayer } from "../ImageDisplayer";
import { Link, redirect } from "react-router-dom";

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
	const [owner, setOwner] = useState("");
	const [messages, setMessages] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);
	const [updateRelations, setUpdateRelations] = useState(true);
	const [message, setMessage] = useState("");
	const [relations, setRelations] = useState<any>({});
	const [users, setUsers] = useState<any>({});
	const [canSendMessage, setCanSendMessage] = useState(false);
	const [showUserList, setShowUserList] = useState(false);
	const [isToggleBox, setIsToggleBox] = useState(false);
	const [admins, setAdmins] = useState<any[]>([]);

	// Load the owner of the channel
	useEffect(() => {
		if (channel[0] === "_" || !updateRelations) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/${channel}`
			)
			.then((res) => {
				setOwner(res.data.ownerLogin);
			})
			.then(() => {
				setUpdateRelations(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [channel, updateRelations]);

	//  Load the admins of the channel
	useEffect(() => {
		if (channel[0] === "_" || !updateRelations) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/channel/${channel}/admins`
			)
			.then((res) => {
				setAdmins(
					res.data.map((membership: any) => membership.userLogin)
				);
			})
			.then(() => {
				setUpdateRelations(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [channel, updateRelations]);

	//  Load the possibility to send messages or not depending on whether the user is blocked or not, or if the user is muted
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
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/channel/${channel}`
			)
			.then((memberships) => {
				for (let membership of memberships.data) {
					if (membership.userLogin === user.login) continue;
					if (membership.userLogin in relations) continue;
					setRelations({
						...relations,
						[membership.userLogin]: {
							isBlocked: false,
							isFriend: false,
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
			}).catch((err) => {
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
					setUsers({
						...users,
						[login]: res.data,
					});
				})
				.catch(() => console.log("error"));
		}
	}, [relations, user.login, users]);

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

	const sendMessage = async () => {
		if (!canSendMessage) return;
		let printableRegexButNoSpace = /[\S\x21-\x7E\u{A0}-\u{FFFF}]/gu; // Matches any printable characters (including Unicode) except space
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

	const toggleBox = async (login = user.login) => {
		if (login === user.login) return redirect(`/profile/${user.login}`); //TODO: replace the redirect by something else that works
		setIsToggleBox(!isToggleBox);
	};

	const askForGame = () => {
		//TODO: ask the other person for game
		toggleBox();
	};

	const promote = (login: string) => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: true,
				}
			)
			.then(() => {
				setUpdateRelations(true);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const demote = (login: string) => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: false,
				}
			)
			.then(() => {
				setUpdateRelations(true);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const kick = (login: string) => {
		//TODO: kick someone from the channel
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`
			)
			.then(() => {
				//TODO: update the channel list containing all the users
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const mute = (login: string) => {
		//TODO: mute someone from the channel
	};

	const ban = (login: string) => {
		//TODO: ban someone from the channel
	};

	return (
		<div>
			<button onClick={() => setChannel(null)}>Back</button>
			{channel[0] !== "_" && (
				<button onClick={() => setShowUserList(!showUserList)}>
					{showUserList ? "X" : "User List"}
				</button>
			)}
			{!showUserList ? (
				<>
					<h1>
						{channel[0] !== "_"
							? channel
							: getNameOfTheOther(channel)}
					</h1>
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
									avatar={users[message.userLogin].avatar}
									toggleBlock={toggleBlock}
									toggleFriendship={toggleFriendship}
									askForGame={askForGame}
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
				</>
			) : (
				<>
					{Object.keys(users).map((login, i) => (
						<div key={i}>
							<button
								onClick={() => {
									{
										login !== user.login &&
											toggleBox(login);
									}
								}}
							>
								{isToggleBox && (
									<div>
										<Link to={`/profile/${login}`}>
											<label>Profil</label>
										</Link>
										{!relations[login].isBlocked && (
											<button onClick={askForGame}>
												Faire une partie
											</button>
										)}
										{!relations[login].isBlocked && (
											<button
												onClick={() => {
													toggleFriendship(login);
													toggleBox();
												}}
											>
												{relations[login].isFriend
													? "Message privé"
													: "Demander en ami"}
											</button>
										)}
										<button
											onClick={() => {
												toggleBlock(login);
												toggleBox();
											}}
										>
											{relations[login].isBlocked
												? "Débloquer"
												: "Bloquer"}
										</button>
										{user.login === owner &&
											(admins.includes(login) ? (
												<button
													onClick={() => {
														demote(login);
													}}
												>
													Demote
												</button>
											) : (
												<button
													onClick={() => {
														promote(login);
													}}
												>
													Promote
												</button>
											))}
										{(user.login === owner ||
											(admins.includes(user.login) &&
												login !== owner &&
												!admins.includes(login))) && (
											<>
												<button
													onClick={() => {
														kick(login);
													}}
												>
													Kick
												</button>
												<button
													onClick={() => {
														mute(login);
													}}
												>
													Mute
												</button>
												<button
													onClick={() => {
														ban(login);
													}}
												>
													Ban
												</button>
											</>
										)}
									</div>
								)}
								{user.login !== login ? (
									<label>
										{login}{" "}
										{relations[login].isBlocked
											? "(bloqué)"
											: ""}
									</label>
								) : (
									<label>{login} (you) </label>
								)}
								<PPDisplayer
									login={login}
									size={50}
									status={true}
								>
									<img
										src={`data:image/*;base64,${users[login].avatar}`}
									/>
								</PPDisplayer>
								{login}
								{login === owner
									? " (owner)"
									: admins.includes(login) && " (admin)"}
							</button>
						</div>
					))}
				</>
			)}
		</div>
	);
};

export default Channel;
