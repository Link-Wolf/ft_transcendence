import { useContext, useEffect, useState } from "react";
import socket from "../../../socket";
import { UserContext } from "../../../App";

const NotificationsButton = ({
	togglePopUp,
	popUpStatus,
}: {
	togglePopUp: Function;
	popUpStatus: boolean;
}) => {
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
	const user = useContext(UserContext);

	useEffect(() => {
		setHasUnreadNotifications(
			localStorage.getItem("hasUnreadNotifications") === "true"
		);
	}, []);

	useEffect(() => {
		const pop = (payload: any) => {
			if (popUpStatus) return;
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

	return (
		<>
			<button onClick={() => togglePopUp()} type='button'>
				Notifications
			</button>
			{hasUnreadNotifications && <div>!</div>}
		</>
	);
};
export default NotificationsButton;
