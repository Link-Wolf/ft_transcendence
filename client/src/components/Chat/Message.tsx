import { useState, useContext } from "react";
import { redirect, Link } from "react-router-dom";
import { UserContext } from "../../App";

const Message = ({
	login,
	date,
	content,
	relation,
	avatar,
	toggleBlock,
	toggleFriendship,
	askForGame,
	admins,
	owner,
}: {
	login: string;
	date: string;
	content: string;
	relation: { isBlocked: boolean; isFriend: boolean };
	avatar: string;
	toggleBlock: Function;
	toggleFriendship: Function;
	askForGame: Function;
	admins: string[];
	owner: string;
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
		//TODO: addback pp
		<>
			{user.login !== login ? (
				<button onClick={toggleBox}>
					{login}{" "}
					{
					login === owner ? "[owner]" : admins.includes(login)
						&& "[admin]"}
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
					{!relation.isBlocked && (
						<button onClick={() => askForGame()}>
							Faire une partie
						</button>
					)}
					{!relation.isBlocked && (
						<button
							onClick={() => {
								toggleFriendship(login);
								toggleBox();
							}}
						>
							{relation.isFriend
								? "Message privé"
								: "Demander en ami"}
						</button>
					)}
					<button
						onClick={() => {
							toggleBlock(login);
							toggleBox();
						}}
					>
						{relation.isBlocked ? "Débloquer" : "Bloquer"}
					</button>
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
