import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../App";

const FriendsNotifications = () => {
	const [oldRequests, setOldRequests] = useState([]);
	const [newRequests, setNewRequests] = useState([]);
	const [update, setUpdate] = useState(true);
	const user = useContext(UserContext);

	useEffect(() => {
		if (!update) return;
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/friendship/invitations/${user.login}`
			)
			.then((res) => {
				setOldRequests(
					res.data.filter(
						(request: any) =>
							new Date(request.createdAt) <=
							new Date(
								localStorage.getItem("lastNotificationCheck") ||
									0
							)
					)
				);
				setNewRequests(
					res.data.filter(
						(request: any) =>
							new Date(request.createdAt) >
							new Date(
								localStorage.getItem("lastNotificationCheck") ||
									0
							)
					)
				);
			})
			.catch((err) => console.log(err));
		setUpdate(false);
	}, [update]);

	return (
		<div>
			{oldRequests.length + newRequests.length > 0 ? (
				<>
					{oldRequests.length > 0 &&
						oldRequests.map((request: any) => (
							<div key={request.id}>
								{request.senderLogin} sent you a friend request
							</div>
						))}
					{oldRequests.length > 0 && newRequests.length > 0 && <hr />}
					{newRequests.length > 0 &&
						newRequests.map((request: any) => (
							<div key={request.id}>
								{request.senderLogin} sent you a friend request
							</div>
						))}
				</>
			) : (
				"Nobody new wants to be your friend :("
			)}
		</div>
	);
};
export default FriendsNotifications;
