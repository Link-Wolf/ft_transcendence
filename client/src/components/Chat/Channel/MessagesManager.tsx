import axios from "axios";
import { useState, useEffect, useContext } from "react";
import Message from "../Message";
import socket from "../../../socket";
import { UserContext } from "../../../App";

const MessagesManager = ({
	channel,
	members,
	admins,
	owner,
	setChannel,
}: {
	channel: string;
	members: any;
	admins: string[];
	owner: string;
	setChannel: Function;
}) => {
	const user = useContext(UserContext);
	const [messages, setMessages] = useState<any[]>([]);
	const [message, setMessage] = useState<string>("");
	const [canSendMessage, setCanSendMessage] = useState(false);
	const [update, setUpdate] = useState(true); //TODO: split that bad boy into multiple update states

	useEffect(() => {
		function clic(payload: any) {
			if (payload.channel === channel) setUpdate(true);
		}
		socket.on("newMessage", clic);
		socket.on("membershipUpdate", clic);
		return () => {
			socket.off("newMessage", clic);
			socket.off("membershipUpdate", clic);
		};
	}, [channel]);

	const getNameOfTheOther = (channel: string) => {
		let names = channel.split("_")[1].split("&");
		return names[0] === user.login ? names[1] : names[0];
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			sendMessage();
		}
	};

	const sendMessage = async () => {
		if (!canSendMessage) return;
		let printableRegexButNoSpace = /[\S\x21-\x7E\u{A0}-\u{FFFF}]/gu; // Matches any printable characters (including Unicode) except space
		if (printableRegexButNoSpace.test(message) && message.length < 500)
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
					socket.emit("newMessage", {
						channel: channel,
					});
				})
				.catch((err) => {
					console.log(err);
				});
	};

	//	Load the messages from the server
	useEffect(() => {
		if (!update) return;
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

	//  Load the possibility to send messages or not depending on whether the user is blocked or not, or if the user is muted
	useEffect(() => {
		if (!update) return;
		if (channel[0] === "_") {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}` +
						`://${process.env.REACT_APP_HOSTNAME}` +
						`:${process.env.REACT_APP_BACKEND_PORT}` +
						`/api/block/of/${user.login}`
				)
				.then((res) => {
					const blocked = res.data.some(
						(blocker: any) =>
							blocker.blockerLogin ===
								channel.slice(1).split("&")[0] ||
							blocker.blockerLogin ===
								channel.slice(1).split("&")[1]
					);
					setCanSendMessage(!blocked);
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
					const timeouts = res.data
						.filter(
							(mute: any) =>
								new Date(mute.end) > new Date(Date.now())
						)
						.sort((m1: any, m2: any) => {
							return (
								new Date(m1.end).getTime() -
								new Date(m2.end).getTime()
							);
						});
					if (timeouts.length)
						setTimeout(() => {
							setUpdate(true);
						}, timeouts[0].end - Date.now());
					setCanSendMessage(timeouts.length === 0);
				})
				.catch((err) => {
					console.log(err);
				});
		}
		setUpdate(false);
	}, [update, channel, user.login]);

	return (
		<>
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
						{members[message.userLogin] !== undefined && (
							<Message
								login={message.userLogin}
								date={message.createdAt}
								content={message.content}
								relation={
									message.user.login === user.login
										? {
												isBlocked: false,
												isFriend: false,
										  }
										: members[message.userLogin]
								}
								avatar={members[message.userLogin].user.avatar}
								admins={admins}
								owner={owner}
								setChannel={setChannel}
							/>
						)}
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
	);
};

export default MessagesManager;
