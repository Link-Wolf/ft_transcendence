import { useState } from "react";
import NotificationsButton from "./NotificationsButton";
import NotificationsPopUp from "./NotificationsPopUp";
import NotificationsIcon from "./NotificationIcon";

const Notifications = () => {
	const [showPopup, setShowPopup] = useState(false);

	return (
		<div>
			<NotificationsButton
				togglePopUp={() => {
					if (!showPopup) {
						localStorage.setItem("hasUnreadNotifications", "false");
						localStorage.setItem(
							"lastNotificationCheck",
							Date.now().toString()
						);
					}
					setShowPopup(!showPopup);
				}}
				popUpStatus={showPopup}
			/>
			<NotificationsIcon />
			{showPopup && <NotificationsPopUp />}
		</div>
	);
};
export default Notifications;
