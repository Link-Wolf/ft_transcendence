import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../../../socket";
import { PPDisplayer } from "../../ImageDisplayer";
import { UserContext } from "../../../App";
import MuteBanForm from "./MuteBanForm";
import {
	AskForGameButton,
	BlockUnblockButton,
	DemoteButton,
	FriendPMButton,
	PromoteButton,
} from "../../ActionsButtons";

const ChannelUser = ({
	admins,
	login,
	members,
	owner,
	channel,
	setChannel,
}: {
	admins: string[];
	login: string;
	members: any;
	owner: string;
	channel: string;
	setChannel: Function;
}) => {
	const navigate = useNavigate();
	const user = useContext(UserContext);
	const [isToggleBox, setIsToggleBox] = useState(false);
	const [userStatus, setUserStatus] = useState<any>({
		isMuted: false,
	});
	const [toggleAdminBox, setToggleAdminBox] = useState({
		isActive: false,
		type: "" as "" | "mute" | "ban",
	});

	const toggleBox = async (login = user.login) => {
		console.log("here")
		if (login === user.login) return navigate(`/profile/${user.login}`); //TODO: replace the redirect by something else that works
		if (
			!isToggleBox &&
			(admins.includes(user.login) || user.login === owner)
		) {
			await axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute/user/${login}/channel/${channel}`
				)
				.then((res) => {
					setUserStatus({
						isMuted: res.data.some(
							(mute: any) =>
								new Date(mute.end) >= new Date(Date.now())
						),
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

	const kick = async (login: string) => {
		await axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`
			)
			.then((res) => {
				if (res.data.length !== 0) {
					axios
						.delete(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`
						)
						.then(() => {
							socket.emit("membershipUpdate", {
								channel: channel,
								what: "kick",
								who: login,
							});
							setIsToggleBox(false);
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
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

	const unmuteSomeone = async (login: string) => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute/user/${login}/channel/${channel}`
			)
			.then((res) => {
				if (res.data.length !== 0) {
					console.log(res.data);
					const muteToUnmute = res.data.sort((a: any, b: any) => {
						return a.id - b.id;
					})[0];
					axios
						.delete(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute/user/${muteToUnmute.user.login}/channel/${muteToUnmute.channel.name}`
						)
						.then(() => {
							setIsToggleBox(false);
							setToggleAdminBox({
								isActive: false,
								type: "",
							});
							setUserStatus({
								isMuted: false,
							});
							socket.emit("newMessage", {
								//TODO: change
								channel: channel,
							});
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<>
			{toggleAdminBox.isActive && (
				<MuteBanForm
					channel={channel}
					login={login}
					boxType={toggleAdminBox.type}
					setToggleAdminBox={setToggleAdminBox}
					setIsToggleBox={setIsToggleBox}
					setUserStatus={setUserStatus}
					kick={kick}
				/>
			)}
			<div>
				{isToggleBox && (
					<div>
						<div>
							<Link to={`/profile/${login}`}>
								<label>Profil</label>
							</Link>
							{!members[login].isBlocked && (
								<AskForGameButton login={login} />
							)}
							{!members[login].isBlocked && (
								<FriendPMButton
									login={login}
									isFriend={members[login].isFriend}
									setChannel={setChannel}
								/>
							)}
							<BlockUnblockButton
								login={login}
								isBlocked={members[login].isBlocked}
							/>
							{user.login === owner &&
								(admins.includes(login) ? (
									<DemoteButton
										login={login}
										channel={channel}
									/>
								) : (
									<PromoteButton
										login={login}
										channel={channel}
									/>
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
											setToggleAdminBox({
												isActive: true,
												type: "ban",
											});
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
						toggleBox(login);
					}}
				>
					{user.login !== login ? (
						<label>
							{login} {members[login].isBlocked ? "(bloqué)" : ""}
						</label>
					) : (
						<label>{login} (you) </label>
					)}
					<PPDisplayer login={login} size={50} status={true} />
					{login === owner
						? " (owner)"
						: admins.includes(login) && " (admin)"}
				</button>
			</div>
		</>
	);
};

export default ChannelUser;
