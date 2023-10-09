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
	expires: number;
};

const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	useEffect(() => {
		const updateInterval = setInterval(() => {
			setNotifications((notifications) => {
				return notifications.filter((notification) => {
					return notification.expires > Date.now();
				});
			});
		}, 100);

		return () => {
			clearInterval(updateInterval);
		};
	}, []);

	const addNotifications = (notification: Notification) => {
		setNotifications((notifications) => [...notifications, notification]);
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
			expires: Date.now() + 1000 * duration,
		});
	};

	const error = (title: string, message: string, duration = 5) => {
		context.addNotification({
			type: "error",
			title,
			message,
			expires: Date.now() + 1000 * duration,
		});
	};

	const info = (title: string, message: string, duration = 5) => {
		context.addNotification({
			type: "info",
			title,
			message,
			expires: Date.now() + 1000 * duration,
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
		<div
			onClick={destroy}
			className={style.notification}
		>
			<div className={`${style.ico} ${style[type]}`}>{type === "info" ? "⚪": type === "alert" ? "⚪": "⚪" }</div>
			<div className={style.notifDescrib}>
				<pre className={`${style.notifTitle} ${style[type]}`}>{title.toUpperCase()}</pre>
				<pre className={style.notifMsg}>{message}</pre>
			</div>
		</div>
	);
};

export { useNotifications, NotificationsProvider };
