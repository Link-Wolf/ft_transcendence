import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";

const NotificationsIcon = () => {
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
	const user = useContext(UserContext);

	useEffect(() => {
		setHasUnreadNotifications(
			localStorage.getItem("hasUnreadNotifications") === "true"
		);
	}, []);

	useEffect(() => {
		const pop = (payload: any) => {
			// if (popUpStatus) return;
			if (payload.to === user.login) {
				setHasUnreadNotifications(true);
				localStorage.setItem("hasUnreadNotifications", "true");
			}
		};

		socket.on("newFriendRequest", pop);
		socket.on("newGameRequest", pop);

		return () => {
			socket.off("newFriendRequest", pop);
			socket.off("newGameRequest", pop);
		};
	}, []);

	return <></>; //TODO: return des trucs selon si y'a des nouvelles notifs ou pas
};

export default NotificationsIcon;
