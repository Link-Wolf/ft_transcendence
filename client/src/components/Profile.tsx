import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { Link, useParams } from "react-router-dom";

const Profile = () => {
	const profileLogin = useParams<{ login: string }>().login ?? "";
	const user = useContext(UserContext);
	const isMe = user.login === profileLogin;

	if (!user.clearance || user.clearance === 0)
		return <ThereIsNotEnoughPermsBro />;

	const logout = () => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/logout`,
				{
					withCredentials: true,
				}
			)
			.then(() => {
				window.location.href = "/";
			})
			.catch((err) => {
				console.log(err);
			});
	};

	/**
	 * Profile page
	 */
	return (
		<div>
			<h1>Profile</h1>
			<p>This is ur profile buddy </p>
			<Stats
				isMe={isMe}
				login={profileLogin}
			/>
			<Friends
				isMe={isMe}
				login={profileLogin}
			/>
			<Blocked
				isMe={isMe}
				login={profileLogin}
			/>
			<Link to='/me/update'>Update</Link>
			<button onClick={logout}>Log out</button>
		</div>
	);
};

const Stats = ({ isMe, login }: { isMe: boolean; login: string }) => {
	/**
	 * Stats infos
	 */
	const user = useContext(UserContext);
	const [gameResults, setGameResults] = useState({
		wins: 0,
		losses: 0,
	});

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user-game/results/${login}`
			)
			.then((res) => {
				setGameResults(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<div>
			<h2>
				Stats for {gameResults.losses + gameResults.wins} games played
			</h2>
			<ul>
				<li>Nb of wins : {gameResults.wins}</li>
				<li>Nb of losses : {gameResults.losses}</li>
			</ul>
		</div>
	);
};

const Friends = ({ isMe, login }: { isMe: boolean; login: string }) => {
	/**
	 * Friends management, list and requests
	 */
	const user = useContext(UserContext);
	const [friendShips, setFriendShips] = useState<any[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${login}`
			)
			.then((res) => {
				setFriendShips(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<div>
			<h2>Friends</h2>
			<ul>
				<li>
					Friend List (default)
					<ul>
						{friendShips.length &&
							friendShips.map((friendShip, i) => {
								return (
									<li key={i}>
										{friendShip.senderLogin === user.login
											? friendShip.senderLogin
											: friendShip.receiverLogin}
									</li>
								);
							})}
					</ul>
				</li>
				<li>
					Requests
					<ul>
						<li>Sent</li>
						<li>Received</li>
					</ul>
				</li>
			</ul>
		</div>
	);
};

const Blocked = ({ isMe, login }: { isMe: boolean; login: string }) => {
	/**
	 * Blocked users management
	 */
	const user = useContext(UserContext);
	const [blockedUsers, setBlockedUsers] = useState<any[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/by/${login}`
			)
			.then((res) => {
				setBlockedUsers(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<div>
			<h2>Blocked users</h2>
			<ul>
				{blockedUsers.length &&
					blockedUsers.map((blockedUser, i) => {
						return <li key={i}>{blockedUser.blockedLogin}</li>;
					})}
			</ul>
		</div>
	);
};

export default Profile;
