import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../App";

type Notification = {
	type: "newMP" | "newGame" | "newFriend";
	message: string;
	author: string;
	infos?: any;
};

const NotificationsPopUp = () => {
	const user = useContext(UserContext);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://` +
					`${process.env.REACT_APP_HOSTNAME}:` +
					`${process.env.REACT_APP_BACKEND_PORT}/api/` +
					`friendship/invitations/${user.login}`
			)
			.then((res) => {
				setNotifications((notifs) => [
					...notifs,
					...res.data.map((invite: any) => ({
						type: "newFriend",
						message: `${invite.sender.login} wants to be your friend`,
						author: invite.sender,
					})),
				]);
			})
			.catch((err) => {
				console.log(err);
			});
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://` +
					`${process.env.REACT_APP_HOSTNAME}:` +
					`${process.env.REACT_APP_BACKEND_PORT}/api/` +
					`game/invitations/${user.login}`
			)
			.then((res) => {
				setNotifications((notifs) => [
					...notifs,
					...res.data.map((invite: any) => ({
						type: "newGame",
						message: `${invite.users[0].login} wants to play with you`,
						author: invite.users[0],
						infos: {
							gameId: invite.gameId,
							modifiers: invite.modifiers,
						},
					})),
				]);
			})
			.catch((err) => {
				console.log(err);
			});
		for (let channel in localStorage.getItem("unreadMP")?.split(",")) {
			axios
				.get(
					`${process.env.REACT_APP_PROTOCOL}://` +
						`${process.env.REACT_APP_HOSTNAME}:` +
						`${process.env.REACT_APP_BACKEND_PORT}/api/` +
						`message/${channel}`
				)
				.then((res) => {
					setNotifications((notifs) => [
						...notifs,
						{
							type: "newMP",
							message:
								res.data[res.data.length - 1].content.length >
								20
									? res.data[
											res.data.length - 1
									  ].content.slice(0, 20) + "..."
									: res.data[res.data.length - 1].content,
							author: res.data[res.data.length - 1].user,
						},
					]);
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}, []);

	return (
		<>
			{notifications.map((notif, i) => (
				<div key={i}>
					{notif.type} {notif.message} {notif.author}
				</div>
			))}
		</>
	);
};
export default NotificationsPopUp;
