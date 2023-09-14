import { useContext, useState } from "react";
import style from "../../style/Chat.module.scss";
import Channel from "./Channel/Channel";
import ChannelList from "./ChannelList";
import MPList from "./MPList";
import { UserContext } from "../../App";

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	/**
	 * Chatbox component, either call the current Channel component, or list the channels the user is in (both channels and dms)
	 */
	const user = useContext(UserContext);

	return (
		<div className={style.chatbox}>
			<div className={style.top}>
				<p className={style.cam}>O o</p>
				<button
					className={style.toggleChat}
					onClick={() => toggleChat()}
				>
					X
				</button>
			</div>
			{!user.channel ? (
				<>
					<ChannelList setChannel={user.setChannel} />
					<MPList setChannel={user.setChannel} />
				</>
			) : (
				<Channel channel={user.channel} setChannel={user.setChannel} />
			)}
		</div>
	);
};

export default ChatBox;
