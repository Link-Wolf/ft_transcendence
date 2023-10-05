import { useState, useContext } from "react";
import { redirect, Link, useNavigate } from "react-router-dom";
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
	const navigate = useNavigate();

	const toggleBox = async () => {
		if (login === user.login) {
			// navigate(`/profile/${user.login}`);
			return;
		}
		setIsToggleBox(!isToggleBox);
	};

	if (!relation) return <>loading... {login}</>;
	return (
		<>
			<div 
				className={
					user.login === login ? style.sendmessage : style.recvmessage
				}
			>
				<div onClick={toggleBox}>
				<PPDisplayer login={login} size={40} status={true} />
				</div>
				<div onClick={toggleBox}>
				<div className={style.senderinfo}>
					{isToggleBox && (
						<div>
							<Link to={`/profile/${login}`}>
								<button>Profil</button>
							</Link>
							{!relation.isBlocked && (
								<AskForGameButton login={login} />
								)}
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

					{user.login !== login ? (
						<button onClick={toggleBox} className={style.profil}>
							{name}{" "}
							{login === owner.login
								? "[owner]"
								: admins.some(
									(admin) => admin.login === login
									) && "[admin]"}
							{relation.isBlocked ? "(bloqué)" : ""}
						</button>
					) : (
						<label>{name} (you) </label>
						)}

					<p className={style.message}>
						{relation.isBlocked
							? "Ce message est masquée"
							: content}
					</p>
					<p className={style.time}>
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
					</p>
				</div>
				</div>
			</div>
		</>
	);
};

export default Message;
