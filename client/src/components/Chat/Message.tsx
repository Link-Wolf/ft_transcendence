import { useState, useContext } from "react";
import { redirect, Link } from "react-router-dom";
import { UserContext } from "../../App";
import {
	AskForGameButton,
	BlockButton,
	FriendButton,
	PMButton,
	UnblockButton,
} from "../ActionsButtons";
import { PPDisplayer } from "../ImageDisplayer";
import style from "../../style/Chat.module.scss";

const Message = ({
	name,
	login,
	date,
	content,
	relation,
	avatar,
	admins,
	owner,
	setChannel,
}: {
	name: string;
	login: string;
	date: string;
	content: string;
	relation: { isBlocked: boolean; isFriend: boolean };
	avatar: string;
	admins: any[];
	owner: any;
	setChannel: Function;
}) => {
	/**
	 * Message component, display a message with the user's avatar, name, date, content and a button to interact with the user
	 */
	const [isToggleBox, setIsToggleBox] = useState(false);
	const user = useContext(UserContext);

	const toggleBox = async () => {
		if (login === user.login) return redirect(`/profile/${user.login}`); //TODO: replace the redirect by something else that works
		setIsToggleBox(!isToggleBox);
	};

	if (!relation) return <>loading... {login}</>;
	return (
		<>
		<div className={style.headmessage}>
			<PPDisplayer
				login={login}
				size={40}
				status={true}
			>
				<img src={`data:image/*;base64,${avatar}`} />
			</PPDisplayer>
			<div className={style.senderinfo}>
			{user.login !== login ? (
				<button onClick={toggleBox}>
					{name}{" "}
					{login === owner.login
						? "[owner]"
						: admins.some((admin) => admin.login === login) &&
						  "[admin]"}
					{relation.isBlocked ? "(bloqué)" : ""}
				</button>
			) : (
				<label>{name} (you) </label>
			)}
			{isToggleBox && (
				<div>
					<Link to={`/profile/${login}`}>
						<label>Profil</label>
					</Link>
					{!relation.isBlocked && <AskForGameButton login={login} />}
					{!relation.isBlocked &&
						(relation.isFriend ? (
							<PMButton
								login={login}
								setChannel={setChannel}
							/>
						) : (
							<FriendButton login={login} />
						))}
					{relation.isBlocked ? (
						<UnblockButton login={login} />
					) : (
						<BlockButton login={login} />
					)}
				</div>
			)}
			<label>
				{new Date(date).toLocaleDateString() ===
				new Date().toLocaleDateString()
					? new Date(date).toISOString().slice(11, 16) //if today, get an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) and slice it to only get HH:mm
					: new Date(date)
							.toLocaleString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit",
								day: "2-digit",
								month: "2-digit",
								year: "2-digit",
							})
							.replace(",", "")}
			</label>
			</div>
			</div>
			<p className={style.message}>{relation.isBlocked ? "Ce message est masquée" : content}</p>
		</>
	);
};

export default Message;
