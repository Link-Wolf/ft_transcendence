import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import ThereIsNotEnoughPermsBro from "./ThereIsNotEnoughPermsBro";
import { Link, useParams } from "react-router-dom";
import { PPDisplayer } from "./ImageDisplayer";
import { use } from "matter-js";

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
			<Resume
				isMe={isMe}
				login={profileLogin}
			/>
			<MatchHistory
				isMe={isMe}
				login={profileLogin}
			/>
			{isMe && (
				<>
					<Friends login={profileLogin} />
					<Blocked login={profileLogin} />
					<Settings login={profileLogin} />
				</>
			)}
			{!isMe && <SocialInterractions login={profileLogin} />}
			<button onClick={logout}>Log out</button>
		</div>
	);
};

const Resume = ({ isMe, login }: { isMe: boolean; login: string }) => {
	const context = useContext(UserContext);
	const [user, setUser] = useState<any>({});

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((res) => {
				setUser(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	return (
		<>
			<PPDisplayer
				login={user.login}
				size={420}
				status={true}
			/>
			<div>
				{user.name} ({user.login})
			</div>
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
					console.log(game);
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
				console.log(err);
			});
	}, []);

	return (
		<div>
			<MatchStats
				isMe={isMe}
				login={login}
				rankedGames={rankedGames}
				normalGames={normalGames}
			/>
			<h2>Match history</h2>
			<h3>Ranked</h3>
			<ul>
				{rankedGames.length > 0 ? (
					rankedGames.map((game, i) => {
						if (game.game.status === "ongoing")
							return (
								<>
									Oui oui je ferai un cas particulier pour les
									ongoing TODO: tout ca tout ca
								</>
							);
						return (
							<li key={i}>
								{/* Status */}
								<div>
									{game.game.status === "abandoned" &&
										(game.score === 11
											? "Victory (by abandonment)"
											: "Defeat (by abandonment)")}
									{game.game.status === "finished" &&
										(game.score === 11
											? "Victory"
											: "Defeat")}
								</div>
								{/* PP du user */}
								{
									<PPDisplayer
										login={user.login}
										size={69}
										status={false}
									>
										<img
											src={`data:image/*;base64,${game.user.avatar}`}
											alt='Profile picture'
										/>
									</PPDisplayer>
								}
								{/* Nom du user */}
								<div>{game.user.name}</div>
								{/* Score du user */}
								<div>{game.score}</div>
								{/* Score de l'adversaire */}
								<div>{game.opponentUserGame.score}</div>
								{/* Nom de l'adversaire */}
								<div>{game.opponentUserGame.userLogin}</div>
								{/* PP de l'adversaire */}
								{
									<PPDisplayer
										login={game.opponentUserGame.userLogin}
										size={69}
										status={false}
									/>
								}
							</li>
						);
					})
				) : (
					<li>No ranked games played</li>
				)}
			</ul>
			<h3>Not ranked</h3>
			<ul>
				{normalGames.length > 0 ? (
					normalGames.map((game, i) => {
						console.log(game);
						if (game.game.status === "waiting") return;
						if (game.game.status === "ongoing")
							return (
								<>
									Oui oui je ferai un cas particulier pour les
									ongoing TODO: tout ca tout ca
								</>
							);
						return (
							<li key={i}>
								{/* Status */}
								<div>
									{game.game.status === "abandoned" &&
										(game.score === 11
											? "Victory (by abandonment)"
											: "Defeat (by abandonment)")}
									{game.game.status === "finished" &&
										(game.score === 11
											? "Victory"
											: "Defeat")}
								</div>
								{/* PP du user */}
								{
									<PPDisplayer
										login={user.login}
										size={69}
										status={false}
									/>
								}
								{/* Nom du user */}
								<div>{game.user.name}</div>
								{/* Score du user */}
								<div>{game.score}</div>
								{/* Score de l'adversaire */}
								<div>{game.opponentUserGame.score}</div>
								{/* Nom de l'adversaire */}
								<div>{game.opponentUserGame.userLogin}</div>
								{/* PP de l'adversaire */}
								{
									<PPDisplayer
										login={game.opponentUserGame.userLogin}
										size={69}
										status={false}
									/>
								}
							</li>
						);
					})
				) : (
					<li>No friendly games played</li>
				)}
			</ul>
		</div>
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
	}, []);

	useEffect(() => {
		let wins = 0;
		let losses = 0;
		normalGames.forEach((game) => {
			if (game.score === 11) wins++;
			else losses++;
		});
		setNormalGameResults({ wins, losses });
	}, []);

	useEffect(() => {
		setGameResults({
			wins: rankedGameResults.wins + normalGameResults.wins,
			losses: rankedGameResults.losses + normalGameResults.losses,
		});
	}, [rankedGameResults, normalGameResults]);

	return (
		<div>
			<h2>
				Stats for all {gameResults.losses + gameResults.wins} games
				played
			</h2>
			<ul>
				<li>Nb of wins : {gameResults.wins}</li>
				<li>Nb of losses : {gameResults.losses}</li>
			</ul>
			<h3>
				Stats for all{" "}
				{rankedGameResults.losses + rankedGameResults.wins} ranked games
				played
			</h3>
			<ul>
				<li>Nb of wins : {rankedGameResults.wins}</li>
				<li>Nb of losses : {rankedGameResults.losses}</li>
			</ul>
			<h3>
				Stats for all{" "}
				{normalGameResults.losses + normalGameResults.wins} friendly
				games played
			</h3>
			<ul>
				<li>Nb of wins : {normalGameResults.wins}</li>
				<li>Nb of losses : {normalGameResults.losses}</li>
			</ul>
		</div>
	);
};

const Friends = ({ login }: { login: string }) => {
	/**
	 * Friends management, list and requests
	 */
	const user = useContext(UserContext);
	const [friendShips, setFriendShips] = useState<any[]>([]);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/${login}`
			)
			.then((res) => {
				setFriendShips(res.data);
				setUpdate(false);
			})
			.catch((err) => {
				console.log(err);
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

						.catch((err) => {
							console.log(err);
						});
				}
			})
			.then(() => {
				setUpdate(true);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div>
			<h2>Friends</h2>
			<ul>
				<li>
					Friend List (default)
					<ul>
						{friendShips.length > 0 &&
							friendShips.map((friendShip, i) => {
								let friend: any;
								if (friendShip.sender.login === user.login)
									friend = friendShip.receiver;
								else friend = friendShip.sender;
								return (
									<li key={i}>
										<PPDisplayer
											login={friend.login}
											size={69}
											status={true}
										/>
										<div>{friend.name}</div>
										<div>{friend.login}</div>
										<div>
											Friende since{" "}
											{friendShip.created_at}
										</div>
										<button
											onClick={() => {
												removeFriend(friend.login);
											}}
										>
											{" "}
											Remove friend{" "}
										</button>
									</li>
								);
							})}
					</ul>
				</li>
				<li>
					Requests
					<ul>
						<li>Sent</li>
						{/* TODO: friend requests sent by the user */}
						<li>Received</li>
						{/* TODO: friend requests received by the user and not accepted nor refused yet */}
					</ul>
				</li>
			</ul>
		</div>
	);
};

const Blocked = ({ login }: { login: string }) => {
	/**
	 * Blocked users management and list
	 */
	const user = useContext(UserContext);
	const [blocks, setBlocks] = useState<any[]>([]);
	const [update, setUpdate] = useState<boolean>(true);

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/by/${login}`
			)
			.then((res) => {
				setBlocks(res.data);
				setUpdate(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}, [update]);

	const unblock = async (friendLogin: string) => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${user.login}/${friendLogin}`
			)
			.then(async (res) => {
				if (res.data) {
					await axios
						.delete(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/block/${user.login}/${friendLogin}`,
							{
								withCredentials: true,
							}
						)

						.catch((err) => {
							console.log(err);
						});
				}
			})
			.then(() => {
				setUpdate(true);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div>
			<h2>Blocked users</h2>
			<ul>
				<li>
					Block List (default)
					<ul>
						{blocks.length > 0 &&
							blocks.map((block, i) => {
								let blocked = block.blocked;
								return (
									<li key={i}>
										<PPDisplayer
											login={blocked.login}
											size={69}
											status={false}
										/>
										<div>{blocked.name}</div>
										<div>{blocked.login}</div>
										<div>
											Blocked since {blocked.created_at}
										</div>
										<button
											onClick={() => {
												unblock(blocked.login);
											}}
										>
											Unblock
										</button>
									</li>
								);
							})}
					</ul>
				</li>
			</ul>
		</div>
	);
};

const Settings = ({ login }: { login: string }) => {
	/**
	 * Settings
	 */
	const context = useContext(UserContext);
	const [user, setUser] = useState<any>({});
	const [nameError, setNameError] = useState<string>("");
	const [form, setForm] = useState({
		name: "",
		avatar: "",
		hasTFA: false,
		TFASecret: "",
	});

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/user/${login}`
			)
			.then((res) => {
				setUser(res.data);
			})
			.catch((err) => {
				console.log(err);
			});
	}, []);

	useEffect(() => {
		if (form.name === "" || form.name === user.name) return;
		if (form.name.length < 3) {
			setNameError("Username must be at least 3 characters long");
		} else if (!/^[a-zA-Z]+$/.test(form.name)) {
			setNameError("Username must only contain letters");
		} else {
			setNameError("");
		}
	}, [form.name]);

	if (
		!context.clearance ||
		context.clearance === 0 ||
		context.login !== login
	)
		return <ThereIsNotEnoughPermsBro />;

	const handleFormChange = (e: any) => {
		setForm({ ...form, [e.target.id]: e.target.value });
	};

	const updateProfile = async () => {
		//TODO: update profile
		return;
	};

	return (
		<>
			<h2>Settings</h2>
			<form>
				<div>
					<label>Username</label>
					<input
						id='name'
						type='text'
						value={form.name}
						onChange={handleFormChange}
						placeholder='myAwesomeNewUsername'
					/>
					{nameError !== "" && <div>{nameError}</div>}
				</div>
				<div>
					<PPDisplayer
						login={context.login}
						size={400}
						status={false}
					/>
					<input type='file' />
				</div>
				<div>
					<label>TFA</label>
					<input type='text' />
				</div>
				<button onChange={updateProfile}>Update</button>
			</form>
		</>
	);
};

const SocialInterractions = ({ login }: { login: string }) => {
	//TODO: component only loads on another user's profile, with buttons to block him, add him as friend, ask for a game, etc
	return <></>;
};

export default Profile;
