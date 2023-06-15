import axios from "axios";
import Settings from "./Settings";

const Profile = () => {
	const logout = () => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
				withCredentials: true,
			})
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
			<Stats />
			<Friends />
			<Blocked />
			<Settings />
			<button onClick={logout}>Log out</button>
		</div>
	);
};

const Stats = () => {
	/**
	 * Stats infos
	 */
	return (
		<div>
			<h2>Stats</h2>
			<ul>
				<li>Nb of wins : 0</li>
				<li>Nb of losses : 0</li>
			</ul>
		</div>
	);
};

const Friends = () => {
	/**
	 * Friends management, list and requests
	 */
	return (
		<div>
			<h2>Friends</h2>
			<ul>
				<li>Friend List (default)</li>
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

const Blocked = () => {
	/**
	 * Blocked users management
	 */
	return (
		<div>
			<h2>Blocked</h2>
			<ul>
				<li>Blocked 1</li>
				<li>Blocked 2</li>
				<li>Blocked 3</li>
			</ul>
		</div>
	);
};

export default Profile;
