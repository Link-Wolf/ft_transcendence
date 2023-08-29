import axios from "axios";
import { useContext, useState } from "react";
import { Link, redirect } from "react-router-dom";
import socket from "../../../socket";
import { PPDisplayer } from "../../ImageDisplayer";
import { UserContext } from "../../../App";

const ChannelUser = ({
	admins,
	login,
	members,
	askForGame,
	toggleFriendship,
	toggleBlock,
	owner,
	channel,
}: {
	admins: string[];
	login: string;
	members: any;
	owner: string;
	channel: string;
	askForGame: Function;
	toggleFriendship: Function;
	toggleBlock: Function;
}) => {
	const user = useContext(UserContext);
	const [isToggleBox, setIsToggleBox] = useState(false);
	const [userStatus, setUserStatus] = useState<any>({
		isMuted: false,
	});
	const [toggleAdminBox, setToggleAdminBox] = useState({
		isActive: false,
		type: "" as "" | "mute" | "ban",
	});
	const [adminForm, setAdminForm] = useState<any>({
		login: "",
		reason: "",
		end_date: "",
	});

	const toggleBox = async (login = user.login) => {
		if (login === user.login) return redirect(`/profile/${user.login}`); //TODO: replace the redirect by something else that works
		if (!isToggleBox && admins.includes(user.login)) {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute/user/${login}/channel/${channel}`
				)
				.then((res) => {
					setUserStatus({
						isMuted: res.data.length !== 0,
					});
				})
				.then(() => {
					setIsToggleBox(!isToggleBox);
				})
				.catch((err) => {
					console.log(err);
				});
		} else setIsToggleBox(!isToggleBox);
	};

	const promote = (login: string) => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: true,
				}
			)
			.then(() => {
				setIsToggleBox(false);
				socket.emit("newMessageDaddy", {
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const demote = (login: string) => {
		axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: false,
				}
			)
			.then(() => {
				setIsToggleBox(false);
				socket.emit("newMessageDaddy", {
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const kick = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`
			)
			.then(() => {
				socket.emit("newMessageDaddy", {
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const toggleBan = (login: string) => {
		setToggleAdminBox({
			isActive: true,
			type: "ban",
		});
	};

	const mute = async (login: string) => {
		if (userStatus.isMuted) {
			await unmuteSomeone(login);
		} else {
			setToggleAdminBox({
				isActive: true,
				type: "mute",
			});
		}
	};

	const muteSomeone = async (login: string) => {
		//TODO: mute someone from the channel
		setUserStatus({
			isMuted: true,
		});
		socket.emit("newMessageDaddy", {
			channel: channel,
		});
	};

	const unmuteSomeone = async (login: string) => {
		//TODO: unmute someone from the channel
		setUserStatus({
			isMuted: false,
		});
		socket.emit("newMessageDaddy", {
			channel: channel,
		});
	};

	const ban = (login: string) => {
		setToggleAdminBox({
			isActive: true,
			type: "ban",
		});
		//TODO: ban someone from the channel
		socket.emit("newMessageDaddy", {
			channel: channel,
		});
	};

	return (
		<>
			{toggleAdminBox.isActive && (
				<div /*RELATIVE */>
					<div>{/* FIXED INFINITE */}</div>
					<div /* ignore sa petite soeurs*/>
						<form>
							{toggleAdminBox.type === "mute" && (
								<select value={0}>
									<option value={0} disabled>
										Choisis la duree du mute
									</option>
									<option value={5}>5 minutes</option>
									<option value={10}>10 minutes</option>
									<option value={30}>30 minutes</option>
									<option value={60}>1 heure</option>
									<option value={12 * 60}>12 heures</option>
									<option value={24 * 60}>24 heures</option>
									<option
										value={
											(0.00000036 *
												40 *
												7 *
												3 *
												1 *
												2 *
												10) ^
											8
										}
									>
										42 jours
									</option>
								</select>
							)}
							<input
								value=''
								name='reason'
								placeholder='why tho ?'
							/>
							<button
								onClick={() => {
									toggleAdminBox.type === "mute"
										? muteSomeone(login)
										: ban(login);
								}}
							>
								{toggleAdminBox.type === "mute"
									? "Censor him"
									: "Apply the banhammer"}
							</button>
						</form>
					</div>
				</div>
			)}
			<div>
				{isToggleBox && (
					<div>
						<div>
							<Link to={`/profile/${login}`}>
								<label>Profil</label>
							</Link>
							{!members[login].isBlocked && (
								<button
									onClick={() => {
										askForGame();
									}}
								>
									Faire une partie
								</button>
							)}
							{!members[login].isBlocked && (
								<button
									onClick={() => {
										toggleFriendship(login);
										toggleBox();
									}}
								>
									{members[login].isFriend
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
								{members[login].isBlocked
									? "Débloquer"
									: "Bloquer"}
							</button>
							{user.login === owner &&
								(admins.includes(login) ? (
									<button
										onClick={() => {
											demote(login);
										}}
									>
										Demote
									</button>
								) : (
									<button
										onClick={() => {
											promote(login);
										}}
									>
										Promote
									</button>
								))}
							{(user.login === owner ||
								(admins.includes(user.login) &&
									login !== owner &&
									!admins.includes(login))) && (
								<>
									<button
										onClick={() => {
											kick(login);
										}}
									>
										Kick
									</button>
									<button
										onClick={() => {
											mute(login);
										}}
									>
										{userStatus.isMuted ? "Unmute" : "Mute"}
									</button>
									<button
										onClick={() => {
											ban(login);
										}}
									>
										Ban
									</button>
								</>
							)}
						</div>
					</div>
				)}
				<button
					onClick={() => {
						{
							login !== user.login && toggleBox(login);
						}
					}}
				>
					{user.login !== login ? (
						<label>
							{login} {members[login].isBlocked ? "(bloqué)" : ""}
						</label>
					) : (
						<label>{login} (you) </label>
					)}
					<PPDisplayer login={login} size={50} status={true}>
						<img
							src={`data:image/*;base64,${members[login].user.avatar}`}
						/>
					</PPDisplayer>
					{login === owner
						? " (owner)"
						: admins.includes(login) && " (admin)"}
				</button>
			</div>
		</>
	);
};

export default ChannelUser;
