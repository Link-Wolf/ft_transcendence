import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../App";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { useParams } from "react-router-dom";
import { PPDisplayer } from "./ImageDisplayer";
import Update from "./Update";
import {
	AskForGameButton,
	BlockUnblockButton,
	UnblockButton,
	FriendUnfriendButton,
	FriendButton,
	UnfriendButton,
} from "./ActionsButtons";
import socket from "../socket";
import style from "../style/Profile.module.scss";
import { Link } from "react-router-dom";
import stats from "../assets/stats.png";
import history from "../assets/history.png";
import friends from "../assets/friends.png";

const Profile = () => {
	/**
	 * Profile page, display the user's profile if the user is logged in and has enough clearance
	 */
	const [displayedMenu, setDisplayedMenu] = useState(
		"" as "" | "stats" | "friends" | "settings"
	);
	const profileLogin = useParams<{ login: string }>().login ?? "";
	const user = useContext(UserContext);
	const isMe = user.login === profileLogin;

	useEffect(() => {
		setDisplayedMenu("");
	}, [profileLogin]);

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
				// console.log(err);
			});
	};

	/**
	 * Profile page
	 */

	return (
		<div>
			<div className={style.profil}>
				<div className={style.resume}>
					<h1>P R O F I L E &nbsp; O F</h1>
					<Resume isMe={isMe} login={profileLogin} />
					<button
						className={style.button}
						onClick={() => {
							setDisplayedMenu((dp) =>
								dp === "stats" ? "" : "stats"
							);
						}}
					>
						S T A T S
					</button>
					<div>
						{isMe ? (
							<>
								<button
									title='Friends List'
									className={`${style.button} ${style.shape} ${style.friend}`}
									onClick={() => {
										setDisplayedMenu((dp) =>
											dp === "friends" ? "" : "friends"
										);
									}}
								>
									👥
								</button>
								<button
									title='Edit Profil'
									className={`${style.button} ${style.shape} ${style.settings}`}
									onClick={() => {
										setDisplayedMenu((dp) =>
											dp === "settings" ? "" : "settings"
										);
									}}
								>
									🖋️
								</button>
								<button
									title='Log out'
									className={`${style.button} ${style.shape} ${style.alert}`}
									onClick={logout}
								>
									❌
								</button>
							</>
						) : (
							<>
								<FriendUnfriendButton
									login={profileLogin}
									className={`${style.button} ${style.shape} ${style.friend}`}
								/>
								<AskForGameButton
									login={profileLogin}
									className={`${style.button} ${style.shape} ${style.settings}`}
								/>
								<BlockUnblockButton
									login={profileLogin}
									className={`${style.button} ${style.shape} ${style.alert}`}
								/>
							</>
						)}
					</div>
				</div>
				<div className={style.menu}>
					{displayedMenu === "stats" ? (
						<div className={style.stats}>
							<MatchHistory isMe={isMe} login={profileLogin} />
						</div>
					) : (
						<></>
					)}
					{isMe && (
						<>
							{displayedMenu === "friends" ? (
								<div className={style.friends}>
									<img
										src={friends}
										className={style.img}
									></img>
									<div>
										<Friends />
										<Blocked />
									</div>
								</div>
							) : (
								<></>
							)}
							{displayedMenu === "settings" ? (
								<div className={style.settings}>
									<img src='https://primedepartamentos.com/images/icons/settings-icon-white.png'></img>
									<Update />
								</div>
							) : (
								<></>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

const Resume = ({ login }: { isMe: boolean; login: string }) => {
	const [user, setUser] = useState<any>({});
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		socket.on("contextUpdate", (payload) => {
			if (payload.login !== login) return;
			setUpdate(true);
		});

		return () => {
			socket.off("contextUpdate");
		};
	}, []);

	useMemo(() => {
		setUpdate(true);
	}, [login]);

	useEffect(() => {
		if (!update) return;
		setUpdate(false);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((res) => {
				setUser(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [login, update]);

	return (
		<>
			<div className={style.username}>
				{user.name} ({login})
			</div>
			<PPDisplayer login={login} size={300} status={false} />
		</>
	);
};

const MatchHistory = ({ isMe, login }: { isMe: boolean; login: string }) => {
	/**
	 * History of games played
	 */
	const user = useContext(UserContext);
	const [rankedGames, setRankedGames] = useState<any[]>([]);
	const [normalGames, setNormalGames] = useState<any[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user-game/user/${login}`
			)
			.then((res) => {
				let ranked = Array<any>();
				let normal = Array<any>();
				res.data.forEach((game: any) => {
					if (game.game.isRanked && game.game.status !== "waiting")
						ranked.push(game);
					else if (
						!game.game.isRanked &&
						game.game.status !== "waiting"
					)
						normal.push(game);
				});
				setRankedGames(ranked);
				setNormalGames(normal);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [login]);

	return (
		<>
			<div>
				<MatchStats
					isMe={isMe}
					login={login}
					rankedGames={rankedGames}
					normalGames={normalGames}
				/>
			</div>
			<div>
				<img src={history}></img>
				<div className={style.statshistory}>
					<h2>M A T C H _ H I S T O R Y</h2>
					<h3>R A N K E D</h3>
					<div className={style.class}>
						{rankedGames.length > 0 ? (
							rankedGames.map((game, i) => {
								if (game.game.status === "waiting") return;
								return (
									<div className={style.match} key={i}>
										<div>
											{game.game.status === "ongoing" &&
												"Ongoing"}
											{game.game.status === "abandoned" &&
												(game.score === 11
													? "Victory (by abandonment)"
													: "Defeat (by abandonment)")}
											{game.game.status === "finished" &&
												(game.score === 11
													? "Victory"
													: "Defeat")}
										</div>
										<div className={style.score}>
											<div className={style.usermatch}>
												{
													<PPDisplayer
														login={login}
														size={60}
														status={false}
													/>
												}
											</div>
											{game.game.status !== "ongoing" ? (
												<div className={style.result}>
													{" "}
													[ {game.score} ] vs [ 
													{
														game.opponentUserGame
															.score
													}{" "}
													]{" "}
												</div>
											) : (
												<div className={style.result}>
													{" "}
													[ 0 ] vs [ 0 ]{" "}
												</div>
											)}
											<div className={style.usermatch}>
												<Link
													to={`/profile/${game.opponentUserGame.userLogin}`}
												>
													{
														<PPDisplayer
															login={
																game
																	.opponentUserGame
																	.userLogin
															}
															size={60}
															status={false}
														/>
													}
												</Link>
											</div>
										</div>
										<p>--------------------------------</p>
									</div>
								);
							})
						) : (
							<p>No ranked games played</p>
						)}
					</div>
					<h3>N O T _ R A N K E D</h3>
					<div className={style.class}>
						{normalGames.length > 0 ? (
							normalGames.map((game, i) => {
								if (game.game.status === "waiting") return;
								return (
									<div className={style.match}>
										<div>
											{game.game.status === "ongoing" &&
												"Ongoing"}
											{game.game.status === "abandoned" &&
												(game.score === 11
													? "Victory (by abandonment)"
													: "Defeat (by abandonment)")}
											{game.game.status === "finished" &&
												(game.score === 11
													? "Victory"
													: "Defeat")}
										</div>
										<div className={style.score}>
											<div className={style.usermatch}>
												{
													<PPDisplayer
														login={login}
														size={60}
														status={false}
													/>
												}
											</div>
											{game.game.status !== "ongoing" ? (
												<div className={style.result}>
													{" "}
													[ {game.score} ] vs [ 
													{
														game.opponentUserGame
															.score
													}{" "}
													]{" "}
												</div>
											) : (
												<div className={style.result}>
													{" "}
													[ 0 ] vs [ 0 ]{" "}
												</div>
											)}
											<div className={style.usermatch}>
												<Link
													to={`/profile/${game.opponentUserGame.userLogin}`}
												>
													{
														<PPDisplayer
															login={
																game
																	.opponentUserGame
																	.userLogin
															}
															size={60}
															status={false}
														/>
													}
												</Link>
											</div>
										</div>
										<p>--------------------------------</p>
									</div>
								);
							})
						) : (
							<p>No friendly games played</p>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const MatchStats = ({
	isMe,
	login,
	rankedGames,
	normalGames,
}: {
	isMe: boolean;
	login: string;
	rankedGames: any[];
	normalGames: any[];
}) => {
	const user = useContext(UserContext);
	const [gameResults, setGameResults] = useState({
		wins: 0,
		losses: 0,
	});

	const [rankedGameResults, setRankedGameResults] = useState({
		wins: 0,
		losses: 0,
	});

	const [normalGameResults, setNormalGameResults] = useState({
		wins: 0,
		losses: 0,
	});

	useEffect(() => {
		let wins = 0;
		let losses = 0;
		rankedGames.forEach((game) => {
			if (game.score === 11) wins++;
			else losses++;
		});
		setRankedGameResults({ wins, losses });
	}, [rankedGames]);

	useEffect(() => {
		let wins = 0;
		let losses = 0;
		normalGames.forEach((game) => {
			if (game.score === 11) wins++;
			else losses++;
		});
		setNormalGameResults({ wins, losses });
	}, [normalGames]);

	useEffect(() => {
		setGameResults({
			wins: rankedGameResults.wins + normalGameResults.wins,
			losses: rankedGameResults.losses + normalGameResults.losses,
		});
	}, [rankedGameResults, normalGameResults]);

	return (
		<>
			<img src={stats}></img>
			<div className={style.statsbanner}>
				<h2>
					{gameResults.losses + gameResults.wins} <br />
					games played
				</h2>
				<p>
					Wins : {gameResults.wins}
					<br />
					Losses : {gameResults.losses}
				</p>

				<h3>
					{" "}
					{rankedGameResults.losses + rankedGameResults.wins} <br />
					ranked <br />
					games played
				</h3>

				<p>
					Wins : {rankedGameResults.wins}
					<br />
					Losses : {rankedGameResults.losses}
				</p>

				<h3>
					{" "}
					{normalGameResults.losses +
						normalGameResults.wins} <br /> friendly <br />
					games played
				</h3>

				<p>
					Wins : {normalGameResults.wins}
					<br />
					Losses : {normalGameResults.losses}
				</p>
			</div>
		</>
	);
};

const Friends = () => {
	/**
	 * Friends management, list and requests
	 */
	const user = useContext(UserContext);
	const [friendShips, setFriendShips] = useState<any[]>([]);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {}, [
		socket.on("friendUpdate", (payload) => {
			if (payload.loginA === user.login || payload.loginB === user.login)
				setUpdate(true);
		}),
	]);

	useEffect(() => {
		if (!update) return;
		setUpdate(false);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/all/${user.login}`
			)
			.then((res) => {
				setFriendShips(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [update]);

	const removeFriend = async (friendLogin: string) => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${friendLogin}/${user.login}`
			)
			.then(async (res) => {
				if (res.data) {
					await axios
						.delete(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${friendLogin}/${user.login}`,
							{
								withCredentials: true,
							}
						)
						.then(() => {
							socket.emit("friendUpdate", {
								loginA: user.login,
								loginB: friendLogin,
							});
						})
						.catch((err) => {
							// console.log(err);
						});
				}
			})
			.catch((err) => {
				// console.log(err);
			});
	};

	return (
		<div>
			<h2>F R I E N D S</h2>
			<span>
				F R I E N D S _ L I S T
				<div className={style.FriendsList}>
					<span>
						{/* If friendShips is not empty AND at least one of them has pending set to false */}
						{friendShips.length > 0 &&
						friendShips.some(
							(friendShip) => !friendShip.isPending
						) ? (
							friendShips.map((friendShip, i) => {
								if (friendShip.isPending) return;
								let friend: any;
								if (friendShip.sender.login === user.login)
									friend = friendShip.receiver;
								else friend = friendShip.sender;
								return (
									<li key={i} className={style.friendsUser}>
										<Link to={`/profile/${friend.login}`}>
											<PPDisplayer
												login={friend.login}
												size={100}
												status={true}
											/>
										</Link>
										<span>
											{friend.name}
											<br />({friend.login})<br />
										</span>
										{/* <span> */}
										{/* Friend since {friendShip.updated_at} */}
										{/* </span> */}
										<UnfriendButton login={friend.login} />
									</li>
								);
							})
						) : (
							<li>No friends yet uwun't</li>
						)}
					</span>
				</div>
				<span>
					R E Q U E S T S
					<ul>
						<li>Sent</li>
						{friendShips.length > 0 &&
						friendShips.some(
							(friendShip) =>
								friendShip.isPending &&
								friendShip.sender.login === user.login
						) ? (
							friendShips.map((friendShip, i) => {
								if (
									!friendShip.isPending ||
									friendShip.sender.login !== user.login
								)
									return;
								let friend = friendShip.receiver;
								return (
									<li key={i} className={style.requestUser}>
										<PPDisplayer
											login={friend.login}
											size={69}
											status={true}
										/>
										<div>{friend.name}</div>
										<div>{friend.login}</div>
										<button
											onClick={() => {
												removeFriend(friend.login);
											}}
										>
											Cancel request
										</button>
									</li>
								);
							})
						) : (
							<li>No requests sent</li>
						)}
						<li>Received</li>
						{friendShips.length > 0 &&
						friendShips.some(
							(friendShip) =>
								friendShip.isPending &&
								friendShip.receiver.login === user.login
						) ? (
							friendShips.map((friendShip, i) => {
								if (
									!friendShip.isPending ||
									friendShip.receiver.login !== user.login
								)
									return;
								let friend = friendShip.sender;
								return (
									<li key={i} className={style.requestUser}>
										<PPDisplayer
											login={friend.login}
											size={69}
											status={true}
										/>
										<div>{friend.name}</div>
										<div>{friend.login}</div>
										<div>
											Friendship request received on{" "}
											{friendShip.created_at}
										</div>
										<div className={style.acceptbutton}>
											<FriendButton
												login={friend.login}
											/>
											<button
												title='Reject Friend request'
												onClick={() => {
													removeFriend(friend.login);
												}}
											>
												✖️
											</button>
										</div>
									</li>
								);
							})
						) : (
							<li>No requests received</li>
						)}
					</ul>
				</span>
			</span>
		</div>
	);
};

const Blocked = () => {
	/**
	 * Blocked users management and list
	 */
	const user = useContext(UserContext);
	const [blocks, setBlocks] = useState<any[]>([]);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		if (!update) return;
		setUpdate(false);
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/by/${user.login}`
			)
			.then((res) => {
				setBlocks(res.data);
			})
			.catch((err) => {
				// console.log(err);
			});
	}, [update]);

	const touchTheUpdate = () => {
		setUpdate(true);
	};

	return (
		<div>
			<h2>B L O C K E D _ U S E R S</h2>
			<span>
				B L O C K _ L I S T
				<div className={style.FriendsList}>
					<span>
						{blocks.length > 0 ? (
							blocks.map((block, i) => {
								let blocked = block.blocked;
								return (
									<li key={i} className={style.friendsUser}>
										<PPDisplayer
											login={blocked.login}
											size={69}
											status={false}
										/>
										<div>{blocked.name}</div>
										<div>{blocked.login}</div>
										<UnblockButton
											login={blocked.login}
											effect={touchTheUpdate}
										/>
									</li>
								);
							})
						) : (
							<li>No blocked users yet</li>
						)}
					</span>
				</div>
			</span>
		</div>
	);
};

export default Profile;
