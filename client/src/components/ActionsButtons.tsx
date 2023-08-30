import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import socket from "../socket";

const ActionsButtons = () => {
	return <></>;
};

export default ActionsButtons;

const BlockButton = ({ login }: { login: string }) => {
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
				socket.emit("blockUpdate"); //TODO: had receptors
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

const UnblockButton = ({ login }: { login: string }) => {
	const user = useContext(UserContext);

	const unblock = (login: string) => {
		axios
			.delete(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${user.login}/${login}`
			)
			.then(() => {
				socket.emit("blockUpdate");
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

const PromoteButton = ({
	login,
	channel,
}: {
	login: string;
	channel: string;
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
				socket.emit("promotionUpdate", {
					//TODO: had receptors
					channel: channel,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<button type='button' onClick={() => {}}>
			Promote
		</button>
	);
};

const DemoteButton = ({
	login,
	channel,
}: {
	login: string;
	channel: string;
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
				socket.emit("promotionUpdate", {
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

const FriendButton = ({ login }: { login: string }) => {
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
}: {
	login: string;
	setChannel: Function;
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

const UnfriendButton = ({ login }: { login: string }) => {
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

const AskForGameButton = ({ login }: { login: string }) => {
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
};
