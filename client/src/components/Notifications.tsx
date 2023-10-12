import {
	MouseEventHandler,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import style from "../style/Notifications.module.scss";

const NotificationsContext = createContext(
	{} as { addNotification: (notification: Notification) => void }
);

type Notification = {
	type: "error" | "alert" | "info";
	title: string;
	message: string;
	duration: number;
};

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const addNotifications = (notification: Notification) => {
		setNotifications((notifications) => [...notifications, notification]);
		setTimeout(() => {
			setNotifications((notifications) => {
				return notifications.filter((n) => n !== notification);
			});
		}, 1000 * notification.duration);
	};

	const destroyNotification = (notification: Notification) => () => {
		setNotifications((notifications) => {
			return notifications.filter((n) => n !== notification);
		});
	};

	return (
		<NotificationsContext.Provider
			value={{ addNotification: addNotifications }}
		>
			{children}
			<div className={style.container}>
				{notifications.map((notification, i) => (
					<NotificationInfoBox
						key={i}
						destroy={destroyNotification(notification)}
						{...notification}
					/>
				))}
			</div>
		</NotificationsContext.Provider>
	);
};

const useNotifications = () => {
	const context = useContext(NotificationsContext);

	if (!context.addNotification) {
		throw new Error(
			"useNotifications must be used within a NotificationsProvider"
		);
	}

	const alert = (title: string, message: string, duration = 5) => {
		context.addNotification({
			type: "alert",
			title,
			message,
			duration: duration,
		});
	};

	const error = (title: string, message: string, duration = 5) => {
		context.addNotification({
			type: "error",
			title,
			message,
			duration: duration,
		});
	};

	const info = (title: string, message: string, duration = 5) => {
		context.addNotification({
			type: "info",
			title,
			message,
			duration: duration,
		});
	};

	return { alert, error, info };
};

const NotificationInfoBox = ({
	type,
	title,
	message,
	destroy,
}: Notification & { destroy: MouseEventHandler }) => {
	return (
		<div onClick={destroy} className={style.notification}>
			<div className={`${style.ico} ${style[type]}`}>
				{type === "info" ? "⚪" : type === "alert" ? "⚪" : "⚪"}
			</div>
			<div className={style.notifDescrib}>
				<pre className={`${style.notifTitle} ${style[type]}`}>
					{title.toUpperCase()}
				</pre>
				<pre className={style.notifMsg}>{message}</pre>
			</div>
		</div>
	);
};

export { useNotifications, NotificationsProvider };
