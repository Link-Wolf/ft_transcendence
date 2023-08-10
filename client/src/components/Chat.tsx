import { useContext, useState } from "react";
import { UserContext } from "../App";
import ChatBox from "./Chat/ChatBox";
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
				<ChatButton onClick={toggleChat} />
			)}
		</div>
	);
};

const ChatButton = (props: any) => {
	return (
		<button className={style.toggleChat} onClick={props.onClick}>
			Toggle Chat
		</button>
	);
};

export default Chat;
