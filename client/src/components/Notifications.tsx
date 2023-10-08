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

	const alert = (message: string, duration = 5) => {
		context.addNotification({
			type: "alert",
			message,
			expires: Date.now() + 1000 * duration,
		});
	};

	const error = (message: string, duration = 5) => {
		context.addNotification({
			type: "error",
			message,
			expires: Date.now() + 1000 * duration,
		});
	};

	const info = (message: string, duration = 5) => {
		context.addNotification({
			type: "info",
			message,
			expires: Date.now() + 1000 * duration,
		});
	};

	return { alert, error, info };
};

const NotificationInfoBox = ({
	type,
	message,
	destroy,
}: Notification & { destroy: MouseEventHandler }) => {
	return (
		<div
			onClick={destroy}
			className={`${style.notification} ${style[type]}`}
		>
			<h1>{type}</h1>
			<p>{message}</p>
		</div>
	);
};

export { useNotifications, NotificationsProvider };
