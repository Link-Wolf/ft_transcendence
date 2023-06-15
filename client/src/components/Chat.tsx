import { useEffect, useState } from "react";
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

	useEffect(() => {
		// get channels from server
		setChannels(["general", "random"]);
	}, []);

	return (
		<div>
			<h1>Channel List</h1>
			{channels.map((channel, i) => (
				<button
					key={i}
					onClick={() => setChannel(channel)}
				>
					{channel}
				</button>
			))}
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
		// get users from server
		setUsers(["user1", "user2"]);
	}, []);

	return (
		<div>
			<button onClick={() => toggleShowlist()}>Back</button>
			<h1>User List</h1>
			{users.map((user, i) => (
				<button key={i}>{user}</button>
			))}
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
	const [messages, setMessages] = useState<String[]>([]);

	useEffect(() => {
		// get messages from server
		setMessages(["message1", "message2"]);
	}, []);

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
				<p key={i}>{message}</p>
			))}
		</div>
	);
};

export default Chat;
