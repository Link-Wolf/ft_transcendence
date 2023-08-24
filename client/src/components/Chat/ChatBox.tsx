import { useState } from "react";
import style from "../../style/Chat.module.scss";
import Channel from "./Channel";
import ChannelList from "./ChannelList";
import MPList from "./MPList";

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	/**
	 * Chatbox component, either call the current Channel component, or list the channels the user is in (both channels and dms)
	 */
	const [channel, setChannel] = useState<string | null>(null);

	return (
		<div className={style.chatbox}>
			<button className={style.toggleChat} onClick={() => toggleChat()}>
				Close Chat
			</button>
			{!channel ? (
				<>
					<ChannelList setChannel={setChannel} />
					<MPList setChannel={setChannel} />
				</>
			) : (
				<Channel
					channel={channel}
					setChannel={setChannel}
				/>
			)}
		</div>
	);
};

export default ChatBox;
