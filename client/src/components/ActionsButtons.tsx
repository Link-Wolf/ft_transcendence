import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import socket from "../socket";
import PopUp from "./PopUp";
import GameCreationForm from "./GameCreationForm";

const ActionsButtons = () => {
	return <></>;
};

export default ActionsButtons;

/*******************************************************************************
 *******************************  BLOCK BUTTONS  *******************************
 ******************************************************************************/

const BlockButton = ({
	login,
	effect,
	className,
}: {
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);

	const block = (login: string) => {
		axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}/api/toxic-relations/block`,
				{
					userLogin: user.login,
					blocked: login,
				}
			)
			.then(() => {
				socket.emit("relationUpdate", {
					userA: user.login,
					userB: login,
				});
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<button
			className={className}
			type='button'
			onClick={() => {
				block(login);
			}}
		>
			📛
		</button>
	);
};

const UnblockButton = ({
	login,
	effect,
	className,
}: {
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);

	const unblock = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${user.login}/${login}`
			)
			.then(() => {
				socket.emit("relationUpdate", {
					userA: user.login,
					userB: login,
				});
				effect && effect();
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<button
			className={className}
			type='button'
			onClick={() => {
				unblock(login);
			}}
		>
			Unblock
		</button>
	);
};

const BlockUnblockButton = ({
	login,
	effect,
	isBlocked,
	className,
}: {
	login: string;
	effect?: Function;
	isBlocked?: boolean;
	className?: string;
}) => {
	const [_isBlocked, setIsBlocked] = useState(isBlocked);
	const user = useContext(UserContext);

	useEffect(() => {
		if (isBlocked !== undefined) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
			)
			.then((res) => {
				setIsBlocked(res.data.length !== 0);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [_isBlocked]);

	if (_isBlocked)
		return (
			<UnblockButton
				login={login}
				effect={effect}
				className={className}
			/>
		);
	else
		return (
			<BlockButton login={login} effect={effect} className={className} />
		);
};

/*******************************************************************************
 ******************************  PROMOTE BUTTONS  ******************************
 ******************************************************************************/

const PromoteButton = ({
	login,
	channel,
	effect,
	className,
}: {
	login: string;
	channel: string;
	effect?: Function;
	className?: string;
}) => {
	const promote = async (login: string) => {
		await axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: true,
				}
			)
			.then(() => {
				socket.emit("membershipUpdate", {
					channel: channel,
				});
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<button
			type='button'
			onClick={() => {
				promote(login);
			}}
		>
			Promote
		</button>
	);
};

const DemoteButton = ({
	login,
	channel,
	effect,
	className,
}: {
	login: string;
	channel: string;
	effect?: Function;
	className?: string;
}) => {
	const demote = async (login: string) => {
		await axios
			.patch(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`,
				{
					isAdmin: false,
				}
			)
			.then(() => {
				socket.emit("membershipUpdate", {
					channel: channel,
				});
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<button
			type='button'
			onClick={() => {
				demote(login);
			}}
		>
			Demote
		</button>
	);
};

/*******************************************************************************
 *******************************  FRIEND BUTTONS  ******************************
 ******************************************************************************/

const FriendButton = ({
	login,
	effect,
	className,
}: {
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);
	const [friendship, setFriendhip] = useState<any>({});
	const [isBlocked, setIsBlocked] = useState<boolean>(true);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${user.login}/${login}`
			)
			.then((res) => {
				setFriendhip(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
			)
			.then((res) => {
				setIsBlocked(res.data.length !== 0);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, []);

	const friend = async (login: string) => {
		let block = await axios.get(
			`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
		);
		if (block.data.length !== 0) {
			setIsBlocked(true);
			return;
		}
		await axios
			.post(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship`,
				{
					receiverLogin: login,
				}
			)
			.then(() => {
				socket.emit("relationUpdate", {
					userA: user.login,
					userB: login,
				});
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	/*
	Blocked: nop
	Friendship exists?
		pending?
			mine?
				already sent
			not mine?
				accept button
		not pending?
			already friends
	Not exists?
		Be friend button
	*/

	return (
		<button
			className={className}
			type='button'
			title={
				isBlocked
					? "You can not be friend with this user"
					: !friendship
					? "Be Friend"
					: !friendship.isPending
					? "Already Friend"
					: friendship.senderLogin === user.login
					? "Already Sent"
					: "Accept Friend Invitation"
			}
			disabled={
				!(!friendship || friendship.senderLogin !== user.login) &&
				!isBlocked
			}
			onClick={() => {
				(!friendship || friendship.senderLogin !== user.login) &&
					friend(login);
			}}
		>
			{isBlocked
				? "🌀"
				: !friendship
				? "💁‍♂️"
				: !friendship.isPending
				? "👤"
				: friendship.senderLogin === user.login
				? "🕐"
				: "✔️"}
		</button>
	);
};

const PMButton = ({
	login,
	setChannel,
	effect,
	className,
}: {
	login: string;
	setChannel: Function;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);

	return (
		<button
			className={className}
			type='button'
			onClick={() => {
				const logins = [user.login, login].sort();
				setChannel(`_${logins[0]}&${logins[1]}`);
			}}
		>
			Send MP
		</button>
	);
};

const FriendPMButton = ({
	login,
	effect,
	setChannel,
	isFriend,
	className,
}: {
	login: string;
	effect?: Function;
	setChannel: Function;
	isFriend?: boolean;
	className?: string;
}) => {
	const [_isFriend, setIsFriend] = useState(isFriend);
	const user = useContext(UserContext);

	useEffect(() => {
		if (_isFriend === undefined) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${user.login}/${login}`
			)
			.then((res) => {
				setIsFriend(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [_isFriend]);

	if (isFriend)
		return (
			<PMButton
				login={login}
				setChannel={setChannel}
				effect={effect}
				className={className}
			/>
		);
	else
		return (
			<FriendButton login={login} effect={effect} className={className} />
		);
};

const UnfriendButton = ({
	login,
	effect,
	className,
}: {
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);

	const unfriendSomeone = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}` +
					`://${process.env.REACT_APP_HOSTNAME}` +
					`:${process.env.REACT_APP_BACKEND_PORT}` +
					`/api/friendship/${user.login}/${login}`
			)
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<button
			className={className}
			type='button'
			title='Remove friendship'
			onClick={() => {
				unfriendSomeone(login);
			}}
		>
			Remove
		</button>
	);
};

const FriendUnfriendButton = ({
	login,
	effect,
	isFriend,
	className,
}: {
	login: string;
	effect?: Function;
	isFriend?: boolean;
	className?: string;
}) => {
	const [_isFriend, setIsFriend] = useState(isFriend);
	const user = useContext(UserContext);

	useEffect(() => {
		if (_isFriend === undefined) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${user.login}/${login}`
			)
			.then((res) => {
				setIsFriend(res.data.length > 0);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [_isFriend]);
	// console.log(isFriend);
	if (_isFriend)
		return (
			<UnfriendButton
				login={login}
				effect={effect}
				className={className}
			/>
		);
	return <FriendButton login={login} effect={effect} className={className} />;
};

const AskForGameButton = ({
	login,
	effect,
	className,
}: {
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);
	const [isPopUpOpen, setIsPopUpOpen] = useState("");
	const openGameCreationPopup = (login: string) => {
		setIsPopUpOpen(isPopUpOpen === "" ? login : "");
	};

	return (
		<>
			<button
				type='button'
				title='Play a game'
				onClick={() => {
					openGameCreationPopup(login);
				}}
				className={className}
			>
				🎮
			</button>
			{isPopUpOpen !== "" && (
				<PopUp setPopup={setIsPopUpOpen}>
					<GameCreationForm opponentLogin={login} />
				</PopUp>
			)}
		</>
	);
};

const UnbanButton = ({
	login,
	channel,
	effect,
	className,
}: {
	login: string;
	channel: string;
	effect?: Function;
	className?: string;
}) => {
	const unban = (login: string, channel: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/ban/user/${login}/channel/${channel}`
			)
			.then(() => {
				socket.emit("banUpdate", {
					//TODO: better here plz
					user: login,
				});
			})
			.catch((err) => {
				// console.log(err);
			});
	};
	return (
		<button
			className={className}
			type='button'
			onClick={() => {
				unban(login, channel);
			}}
		>
			Unban
		</button>
	);
};

//export all components
export {
	BlockButton,
	UnblockButton,
	AskForGameButton,
	PromoteButton,
	DemoteButton,
	FriendButton,
	UnfriendButton,
	PMButton,
	FriendPMButton,
	BlockUnblockButton,
	UnbanButton,
	FriendUnfriendButton,
};
