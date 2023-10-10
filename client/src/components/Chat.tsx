import { useContext, useState } from "react";
import { UserContext } from "../App";
import ChatBox from "./Chat/ChatBox";
import style from "../style/Chat.module.scss";
import { useLocation } from "react-router-dom";

const Chat = () => {
	/**
	 * Chat component, display the chatbox if the user is logged in and not on the game page
	 */

	const user = useContext(UserContext);
	const location = useLocation();

	const toggleChat = () => {
		user.setChat(!user.chat);
	};

	if (
		!user.clearance ||
		user.clearance === 0 ||
		location.pathname.startsWith("/game") ||
		location.pathname.startsWith("/login") ||
		location.pathname.startsWith("/tfa")
	) {
		return <></>;
	}

	return (
		<div className={style.chat}>
			{user.chat ? (
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
