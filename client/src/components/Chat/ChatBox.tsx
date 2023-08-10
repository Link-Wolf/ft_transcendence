import { useState } from "react";
import style from "../../style/Chat.module.scss";
import Channel from "./Channel";
import ChannelList from "./ChannelList";
import MPList from "./MPList";

const ChatBox = ({ toggleChat }: { toggleChat: Function }) => {
	const [channel, setChannel] = useState<string | null>(null);
	const [showList, setShowList] = useState(false);

	const toggleShowlist = () => {
		setShowList(!showList);
	};

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
					toggleShowlist={toggleShowlist}
					setChannel={setChannel}
				/>
			)}
		</div>
	);
};

export default ChatBox;
