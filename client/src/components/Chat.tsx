import { useContext, useEffect, useState } from "react";
import socket from "../socket";
import axios from "axios"; 
import { UserContext } from "../App";
import { Link } from "react-router-dom";
// import style from "../style/Chat.module.scss";

const Chat = () => {
	const [chat, setChat] = useState(false);

	const toggleChat = () => {
		setChat(!chat);
	};

	return (
		<div>
			{chat ? (
				<ChatBox toggleChat={toggleChat} />
			) : (
				<button onClick={toggleChat}>Toggle Chat</button>
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
		<div>
			<button onClick={() => toggleChat()}>Close Chat</button>
			{!channel ? (
				<ChannelList setChannel={setChannel} />
			) : !showList ? (
				<ChatWindow
					channel={channel}
					toggleShowlist={toggleShowlist}
					setChannel={setChannel}
				/>
			) : (
				<UserList
					channel={channel}
					toggleShowlist={toggleShowlist}
				/>
			)}
		</div>
	);
};

const ChannelList = ({ setChannel }: { setChannel: Function }) => {
	const [channels, setChannels] = useState<String[]>([]);
	const context = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_BACKEND_URL}/membership/user/${context.login}`
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
		console.log("TODO: oui");
	};

	return (
		<div>
			<h1>Channel List</h1>
			<button onClick={addChannel}>+</button>
			{channels.length ? (
				channels.map((channel, i) => (
					<button
						key={i}
						onClick={() => setChannel(channel)}
					>
						{channel}
					</button>
				))
			) : (
				<div>Tu n'as encore rejoins aucun channel bébé sel</div>
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
				`${process.env.REACT_APP_BACKEND_URL}/membership/channel/${channel}`
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
	const [messages, setMessages] = useState<any[]>([]);
	const [update, setUpdate] = useState(true);

	useEffect(() => {
		function clic(payload: String) {
			if (payload === channel) setUpdate(true);
		}

		socket.on("newMessage", clic);
		return () => {
			socket.off("newMessage", clic);
		};
	}, []);

	useEffect(() => {
		if (!update) return;

		axios
			.get(
				`${process.env.REACT_APP_BACKEND_URL}/message/channel/${channel}`
			)
			.then((res) => {
				console.log(res.data);
				setMessages(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
		setUpdate(false);
	}, [update]);

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
					<h2>{message.userLogin}</h2>
					<label>{message.createdAt}</label>
					<p>{message.content}</p>
				</div>
			))}
			<button
				onClick={async () => {
					await axios.post(
						`${process.env.REACT_APP_BACKEND_URL}/message`,
						{
							chanName: "oui",
							content: "test message",
							userLogin: "iCARUS",
						}
					);
				}}
			>
				send message
			</button>
		</div>
	);
};

export default Chat;
