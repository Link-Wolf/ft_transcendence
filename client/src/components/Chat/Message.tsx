import { useState, useContext } from "react";
import { redirect, Link } from "react-router-dom";
import { UserContext } from "../../App";
import StatusIcon from "../StatusIcon";

const Message = ({
	login,
	date,
	content,
	relation,
	avatar,
	toggleBlock,
	toggleFriendship,
}: {
	login: string;
	date: string;
	content: string;
	relation: { isBlocked: boolean; isFriend: boolean };
	avatar: string;
	toggleBlock: Function;
	toggleFriendship: Function;
}) => {
	const [isToggleBox, setIsToggleBox] = useState(false);
	const user = useContext(UserContext);

	const toggleBox = async () => {
		if (login === user.login) return redirect("/me"); //TODO: replace the redirect by something else that works
		setIsToggleBox(!isToggleBox);
	};

	const askForGame = () => {
		//TODO: ask the other person for game
		toggleBox();
	};

	if (!relation) return <>loading... {login}</>;
	return (
		<>
			<img
				src={`data:image/*;base64,${avatar}`}
				alt='avatar'
				style={{
					width: 40,
					height: 40,
					borderRadius: "50%",
					marginRight: "5px",
				}}
			/>
			<StatusIcon login={login} />
			{user.login !== login ? (
				<button onClick={toggleBox}>
					{login} {relation.isBlocked ? "(bloqué)" : ""}
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
						<button onClick={askForGame}>Faire une partie</button>
					)}
					{!relation.isBlocked && <button
						onClick={() => {
							toggleFriendship(login);
							toggleBox();
						}}
					>
						{relation.isFriend
							? "Message privé"
							: "Demander en ami"}
					</button>}
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
