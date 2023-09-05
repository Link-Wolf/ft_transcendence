import { useState } from "react";
import style from "../../style/Chat.module.scss";
import Channel from "./Channel/Channel";
import ChannelList from "./ChannelList";
import MPList from "./MPList";
import Notifications from "./Notifications/Notifications";

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	/**
	 * Chatbox component, either call the current Channel component, or list the channels the user is in (both channels and dms)
	 */
	const [channel, setChannel] = useState<string | null>(null);

	return (
		<div className={style.chatbox}>
			<div>
				<button
					className={style.toggleChat}
					onClick={() => toggleChat()}
				>
					Close Chat
				</button>
				<Notifications />
			</div>
			{!channel ? (
				<>
					<ChannelList setChannel={setChannel} />
					<MPList setChannel={setChannel} />
				</>
			) : (
				<Channel channel={channel} setChannel={setChannel} />
			)}
		</div>
	);
};

export default ChatBox;
