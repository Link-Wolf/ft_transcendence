import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import socket from "../socket";
import PopUp from "./PopUp";

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
}: {
	login: string;
	effect?: Function;
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
			type='button'
			onClick={() => {
				block(login);
			}}
		>
			Block
		</button>
	);
};

const UnblockButton = ({
	login,
	effect,
}: {
	login: string;
	effect?: Function;
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
}: {
	login: string;
	effect?: Function;
	isBlocked: boolean;
}) => {
	if (isBlocked) return <UnblockButton login={login} effect={effect} />;
	else return <BlockButton login={login} effect={effect} />;
};

/*******************************************************************************
 ******************************  PROMOTE BUTTONS  ******************************
 ******************************************************************************/

const PromoteButton = ({
	login,
	channel,
	effect,
}: {
	login: string;
	channel: string;
	effect?: Function;
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
}: {
	login: string;
	channel: string;
	effect?: Function;
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

/*******************************************************************************
 *******************************  FRIEND BUTTONS  ******************************
 ******************************************************************************/

const FriendButton = ({
	login,
	effect,
}: {
	login: string;
	effect?: Function;
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
	}, []);

	const friend = async (login: string) => {
		let block = await axios.get(
			`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
		);
		if (block.data.length !== 0) {
			//TODO: Notify user ?
			console.log(
				`${login} blocked ${user.login}, so no u can't be friend with him !`
			);
			return;
		}
		axios
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
				console.log(err);
			});
	};

	return (
		<button
			type='button'
			disabled={friendship && !isBlocked}
			onClick={() => {
				!friendship && friend(login);
			}}
		>
			{friendship && friendship.isPending ? "Already sent" : "Be friend"}
		</button>
	);
};

const PMButton = ({
	login,
	setChannel,
	effect,
}: {
	login: string;
	setChannel: Function;
	effect?: Function;
}) => {
	const user = useContext(UserContext);

	return (
		<button
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
}: {
	login: string;
	effect?: Function;
	setChannel: Function;
	isFriend: boolean;
}) => {
	const user = useContext(UserContext);

	if (isFriend)
		return (
			<PMButton login={login} setChannel={setChannel} effect={effect} />
		);
	else return <FriendButton login={login} effect={effect} />;
};

const UnfriendButton = ({
	login,
	effect,
}: {
	login: string;
	effect?: Function;
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
				console.log(err);
			});
	};

	return (
		<button
			type='button'
			onClick={() => {
				unfriendSomeone(login);
			}}
		>
			Supprimer ami
		</button>
	);
};

const AskForGameButton = ({
	login,
	effect,
}: {
	login: string;
	effect?: Function;
}) => {
	const user = useContext(UserContext);
	const [isPopUpOpen, setIsPopUpOpen] = useState("");
	const openGameCreationPopup = (login: string) => {
		setIsPopUpOpen(login === "" ? login : "");
	};

	return (
		<>
			<button
				type='button'
				onClick={() => {
					openGameCreationPopup(login);
				}}
			>
				Play
			</button>
			{isPopUpOpen !== "" && (
				<PopUp>
					<h1>Game creation</h1>
				</PopUp>
			)}
		</>
	);
};

const UnbanButton = ({
	login,
	channel,
	effect,
}: {
	login: string;
	channel: string;
	effect?: Function;
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
				console.log(err);
			});
	};
	return (
		<button
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
};
