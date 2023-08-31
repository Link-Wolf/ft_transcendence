import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import socket from "../socket";

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
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block`,
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

	const friend = async (login: string) => {
		let block = await axios.get(
			`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${login}/${user.login}`
		);
		if (block.data.length !== 0) {
			//TODO: cancel friendship request (front-end side) because the target blocked the user
			console.log(
				`${login} blocked ${user.login}, so no u can't be friend with him !`
			);
		}
		console.log(`${user.login} wants to be friend with ${login}`); //TODO: implement friendship request
		socket.emit("relationUpdate", {
			userA: user.login,
			userB: login,
		});
	};

	return (
		<button
			type='button'
			onClick={() => {
				friend(login);
			}}
		>
			Befriend
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
			Envoyer un MP
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
	const askForGame = (login: string) => {
		//TODO: ask the other person for game
	};

	return (
		<button
			type='button'
			onClick={() => {
				askForGame(login);
			}}
		>
			Fer 1 party
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
};
