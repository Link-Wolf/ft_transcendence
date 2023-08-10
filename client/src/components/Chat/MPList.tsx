import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import { PPDisplayer } from "../ImageDisplayer";

const MPList = ({ setChannel }: { setChannel: Function }) => {
	const [memberships, setMemberships] = useState<any[]>([]);
	const [users, setUsers] = useState<any[]>([]);
	const [selectedUser, setSelectedUser] = useState("");
	const [newDMError, setNewDMError] = useState("");
	const context = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/channel/dm/${context.login}`
			)
			.then((response) => {
				//get all memberships from dm channels with current user
				let memberships = response.data.map((channel: any) => {
					return channel.memberships.filter(
						(membership: any) =>
							membership.userLogin !== context.login
					)[0];
				});
				setMemberships(memberships);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [context.login]);

	useEffect(() => {
		//get all friends that haven't dm yet
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/private-message/${context.login}`
			)
			.then((response) => {
				setUsers(response.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [context.login]);

	const openDM = async () => {
		if (
			!selectedUser ||
			selectedUser === undefined ||
			!users.some((user) => user.login === selectedUser)
		) {
			setNewDMError(
				"Not a valid user, login not existing or user blocked you"
			);
			return;
		}

		let dmChannelName = `_${[context.login, selectedUser].sort()[0]}&${
			[context.login, selectedUser].sort()[1]
		}`;

		// -check if dm channel already exists
		if (
			!memberships.some(
				(membership) => membership.channelName === dmChannelName
			)
		) {
			//create the dm channel
			await axios
				.post(
					`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/private-message`,
					{
						loginOther: selectedUser,
					}
				)
				.then((response) => {
					console.log(response.data);
					setChannel(response.data.name);
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			setChannel(dmChannelName);
		}
	};

	return (
		<div>
			<h1>DM List</h1>
			<div>
				<datalist id='new_dm_list'>
					{users.map((user, i) => (
						<option key={i} value={user.login} />
					))}
				</datalist>
				<input
					placeholder="Enter user's login"
					list='new_dm_list'
					onChange={(e) => setSelectedUser(e.target.value)}
				/>
				<button
					disabled={!selectedUser || selectedUser === ""}
					onClick={openDM}
				>
					Go to conv
				</button>
			</div>
			{newDMError !== "" && <div>{newDMError}</div>}

			{memberships.length ? (
				memberships.map((membership, i) => (
					<div
						key={i}
						onClick={() => setChannel(membership.channelName)}
					>
						<PPDisplayer size={100} login={membership.userLogin} />
						{membership.userLogin}
					</div>
				))
			) : (
				<>
					<div>Tu n'as encore eu aucune discussion privée</div>{" "}
					<div>
						Démarres en un depuis le profil d'un autre utilisateur,
						depuis un channel ou ici même dès maintenant
					</div>
				</>
			)}
		</div>
	);
};

export default MPList;
