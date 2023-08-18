import { useContext, useState } from "react";
import { UserContext } from "../App";
import ChatBox from "./Chat/ChatBox";
import style from "../style/Chat.module.scss";
import { useLocation } from "react-router-dom";

const Chat = () => {
	/**
	 * Chat component, display the chatbox if the user is logged in and not on the game page
	 */
	const [chat, setChat] = useState(false);
	const user = useContext(UserContext);
	const location = useLocation();

	const toggleChat = () => {
		setChat(!chat);
	};

	if (
		!user.clearance ||
		user.clearance === 0 ||
		location.pathname === "/game"
	) {
		return <></>;
	}

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
		<button
			className={style.toggleChat}
			onClick={props.onClick}
		>
			Toggle Chat
		</button>
	);
};

export default Chat;
