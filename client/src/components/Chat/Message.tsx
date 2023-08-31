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

const Message = ({
	login,
	date,
	content,
	relation,
	avatar,
	admins,
	owner,
	setChannel,
}: {
	login: string;
	date: string;
	content: string;
	relation: { isBlocked: boolean; isFriend: boolean };
	avatar: string;
	admins: string[];
	owner: string;
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
			<PPDisplayer login={login} size={40} status={true}>
				<img src={`data:image/*;base64,${avatar}`} />
			</PPDisplayer>
			{user.login !== login ? (
				<button onClick={toggleBox}>
					{login}{" "}
					{login === owner
						? "[owner]"
						: admins.includes(login) && "[admin]"}
					{relation.isBlocked ? "(bloqué)" : ""}
				</button>
			) : (
				<label>{login} (you) </label>
			)}
			{isToggleBox && (
				<div>
					<Link to={`/profile/${login}`}>
						<label>Profil</label>
					</Link>
					{!relation.isBlocked && <AskForGameButton login={login} />}
					{!relation.isBlocked &&
						(relation.isFriend ? (
							<PMButton login={login} setChannel={setChannel} />
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
			<p>{relation.isBlocked ? "Ce message est masquée" : content}</p>
		</>
	);
};

export default Message;
