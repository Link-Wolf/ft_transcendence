import FriendsNotifications from "./FriendsNotifications";
import GameNotifications from "./GameNotifications";

const NotificationsPopUp = () => {
	return (
		<>
			<GameNotifications />
			<FriendsNotifications />
		</>
	);
};
export default NotificationsPopUp;
