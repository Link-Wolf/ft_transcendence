import axios from "axios";

const Profile = () => {
	const logout = () => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
				withCredentials: true,
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
			<p>Profile page body content</p>
			<button onClick={logout}>Log out</button>
		</div>
	);
};

export default Profile;
