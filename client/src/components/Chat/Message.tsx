import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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

	if (!relation) return <>loading... {login}</>;
	return (
		<>
			<div
				className={
					user.login === login ? style.sendmessage : style.recvmessage
				}
			>
				<div
					onClick={() => {
						setIsToggleBox((t) => !t);
					}}
				>
					<PPDisplayer login={login} size={40} status={true} />
				</div>
				<div>
					<div className={style.senderinfo}>
						<div className={style.toggleprofil}>
							{isToggleBox && user.login !== login ? (
								<div>
									<button className={style.buttonstart}
										onClick={() => {
											navigate(`/profile/${login}`);
										}}
									>
										Profile
									</button>
									{!relation.isBlocked && (
										<AskForGameButton
											className={style.buttoncenter}
											text={"text"}
											login={login}
										/>
									)}
									{!relation.isBlocked &&
										(relation.isFriend ? (
											<PMButton
											className={style.buttoncenter}
											login={login}
												setChannel={setChannel}
											/>
										) : (
											<FriendButton
											className={style.buttoncenter}
											text={"text"}
												login={login}
											/>
										))}
									{relation.isBlocked ? (
										<UnblockButton 
										className={style.buttonend}
										login={login} />
									) : (
										<BlockButton
										className={style.buttonend}
										text={"Block"}
											login={login}
										/>
									)}
								</div>
							) : user.login !== login ? (
								<button
									// onClick={toggleBox}
									className={style.profil}
								>
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
						</div>
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
