import { useState } from "react";
import style from "../../style/Chat.module.scss";
import Channel from "./Channel/Channel";
import ChannelList from "./ChannelList";
import MPList from "./MPList";

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	/**
	 * Chatbox component, either call the current Channel component, or list the channels the user is in (both channels and dms)
	 */
	const [channel, setChannel] = useState<string | null>(null);

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
