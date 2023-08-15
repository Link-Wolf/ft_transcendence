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

	//enable chat only if the clearance > 0 and pathis not /game
	console.log(window.location.pathname)
	if (!user.clearance || user.clearance === 0 || window.location.pathname === "/game") {
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
		<button className={style.toggleChat} onClick={props.onClick}>
			Toggle Chat
		</button>
	);
};

export default Chat;
