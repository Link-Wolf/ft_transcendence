import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";
import socket from "../../socket";

const NotificationsButton = ({
	togglePopUp,
	popUpStatus,
}: {
	togglePopUp: Function;
	popUpStatus: boolean;
}) => {
	return (
		<>
			<button onClick={() => togglePopUp()} type='button'>
				Notifications
			</button>
		</>
	);
};
export default NotificationsButton;
