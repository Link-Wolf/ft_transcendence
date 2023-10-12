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
	text,
	login,
	effect,
	className,
}: {
	text?: string;
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
				console.log(err);
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
			{text ? "Block" : "📛"}
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
				console.log(err);
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
	text,
	login,
	effect,
	isBlocked,
	className,
}: {
	text?: string;
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
				console.log(err);
			});
	}, [_isBlocked, isBlocked, login, user.login]);

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
			<BlockButton
				text={text}
				login={login}
				effect={effect}
				className={className}
			/>
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
					login: login,
				});
			})
			.catch((err) => {
				console.log(err);
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
					login: login,
				});
			})
			.catch((err) => {
				console.log(err);
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

const PromoteDemoteButton = ({
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
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		setUpdate(true);

		socket.on("membershipUpdate", (data: any) => {
			if (data.channel === channel && data.login === login) {
				setUpdate(true);
			}
		});

		return () => {
			socket.off("membershipUpdate");
		};
	}, []);

	useEffect(() => {
		if (!update) return;
		setUpdate(false);

		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/membership/user/${login}/channel/${channel}`
			)
			.then((res) => {
				setIsAdmin(res.data.isAdmin);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [update, channel, login]);

	if (isAdmin)
		return (
			<DemoteButton
				login={login}
				channel={channel}
				effect={effect}
				className={className}
			/>
		);
	else
		return (
			<PromoteButton
				login={login}
				channel={channel}
				effect={effect}
				className={className}
			/>
		);
};

/*******************************************************************************
 *******************************  FRIEND BUTTONS  ******************************
 ******************************************************************************/

const FriendButton = ({
	text,
	login,
	effect,
	className,
}: {
	text?: string;
	login: string;
	effect?: Function;
	className?: string;
}) => {
	const user = useContext(UserContext);
	const [friendship, setFriendhip] = useState<any>({});
	const [isBlocked, setIsBlocked] = useState<boolean>(true);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		socket.on("friendUpdate", (data: any) => {
			if (
				(data.loginA === user.login && data.loginB === login) ||
				(data.loginA === login && data.loginB === user.login)
			) {
				setUpdate(true);
			}
		});

		return () => {
			socket.off("friendUpdate");
		};
	}, []);

	useEffect(() => {
		setUpdate(true);
	}, [user.login, login]);

	useEffect(() => {
		if (!update) return;
		setUpdate(false);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${user.login}/${login}`
			)
			.then((res) => {
				setFriendhip(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
			)
			.then((res) => {
				setIsBlocked(res.data.length !== 0);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [update, user.login, login]);

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
				socket.emit("friendUpdate", {
					loginA: user.login,
					loginB: login,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

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
				? text
					? "Blocked"
					: "🌀"
				: !friendship
				? text
					? "Be Friend"
					: "💁‍♂️"
				: !friendship.isPending
				? text
					? "Already Friend"
					: "👤"
				: friendship.senderLogin === user.login
				? text
					? "Already Sent"
					: "🕐"
				: text
				? "Accept Friend"
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

	const [memberships, setMemberships] = useState<any[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/dm/${user.login}`
			)
			.then((response) => {
				//get all memberships from dm channels with current user
				let memberships = response.data.map((channel: any) => {
					return channel.memberships.filter(
						(membership: any) => membership.userLogin !== user.login
					)[0];
				});
				setMemberships(memberships);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [user.login]);

	return (
		<button
			className={className}
			type='button'
			onClick={() => {
				if (!login || login === undefined) {
					return;
				}

				let dmChannelName = `_${[user.login, login].sort()[0]}&${
					[user.login, login].sort()[1]
				}`;

				// -check if dm channel already exists
				if (
					!memberships.some(
						(membership) => membership.channelName === dmChannelName
					)
				) {
					//create the dm channel
					axios
						.post(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/private-message`,
							{
								loginOther: login,
							}
						)
						.then((response) => {
							setChannel(response.data.name);
							socket.emit("channelUpdate", {
								users: [user.login, login],
							});
						})
						.catch((err) => {
							console.log(err);
						});
				} else {
					setChannel(dmChannelName);
				}
			}}
		>
			Send PM
		</button>
	);
};

const FriendPMButton = ({
	text,
	login,
	effect,
	setChannel,
	isFriend,
	className,
}: {
	text?: string;
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
				console.log(err);
			});
	}, [_isFriend, login, user.login]);

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
			<FriendButton
				text={text}
				login={login}
				effect={effect}
				className={className}
			/>
		);
};

const UnfriendButton = ({
	text,
	login,
	effect,
	className,
}: {
	text?: string;
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
			.then(() => {
				socket.emit("friendUpdate", {
					loginA: user.login,
					loginB: login,
				});
			})
			.catch((err) => {
				console.log(err);
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
			{text ? "Remove Friends" : "🚮"}
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
	const [update, setUpdate] = useState<boolean>(true);
	const user = useContext(UserContext);

	useEffect(() => {
		socket.on("friendUpdate", (data: any) => {
			if (
				(data.loginA === user.login && data.loginB === login) ||
				(data.loginA === login && data.loginB === user.login)
			) {
				setUpdate(true);
			}
		});

		return () => {
			socket.off("friendUpdate");
		};
	}, []);

	useEffect(() => {
		if (_isFriend !== undefined) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${user.login}/${login}`
			)
			.then((res) => {
				setIsFriend(res.data);
				setUpdate(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [_isFriend, user.login, login, update]);

	if (_isFriend === undefined) return <></>;
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
	text,
	login,
	effect,
	className,
}: {
	text?: string;
	login: string;
	effect?: Function;
	className?: string;
}) => {
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
				{text ? "Play" : "🎮"}
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
				socket.emit("membershipUpdate", {
					channel: channel,
					who: login,
					what: "ban",
				});
			})
			.catch((err) => {
				console.log(err);
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
	PromoteDemoteButton,
	FriendUnfriendButton,
};
