import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import { PPDisplayer } from "../ImageDisplayer";
import style from "../../style/Chat.module.scss";


const MPList = ({ setChannel }: { setChannel: Function }) => {
	/**
	 * List of DMs, either display the list of DMs the user is in, or the menu to create a DM
	 */
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
		<div className={style.mplist}>
			<h1>DM List</h1>
			{newDMError !== "" && <div>{newDMError}</div>}
			
			<div className={style.displaylist}>
			{memberships.length ? (
				memberships.map((membership, i) => (
					<div
					className={style.profilmp}
					key={i}
					onClick={() => setChannel(membership.channelName)}
					>
						<PPDisplayer
							size={80}
							login={membership.userLogin}
							status={true}
							/>
						<button className={style.mpname}>{membership.userLogin}</button>
					</div>
				))
				) : (
				<>
					<p>
						You don't have any DM<br/>
						Start one from another user's profile, from a channel or here
					</p>
				</>
			)}
			</div>
					<div>
						<datalist id='new_dm_list'>
							{users.map((user, i) => (
								<option key={i} value={user.login} />
							))}
						</datalist>
						<input className={style.mpinput}
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
		</div>
	);
};

export default MPList;
