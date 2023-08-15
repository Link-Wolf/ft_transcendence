import axios from "axios";
import Routage from "./components/Routage";
import { createContext, useEffect, useState } from "react";
import style from "./style/App.module.scss";
import socket from "./socket";
import Cookies from "js-cookie";

export const UserContext = createContext({
	login: "",
	clearance: 0,
	theme: "light",
	toggleTheme: () => {},
	status: {} as any,
});

const App = () => {
	const [clearance, setClearance] = useState({
		login: "",
		clearance: 0,
		theme: "light",
		status: {} as any,
	});

	useEffect(() => {
		socket.emit("ping", { auth: Cookies.get("token") });
		let pingInterval = setInterval(() => {
			socket.emit("ping", {
				auth: Cookies.get("token"),
				status:
					document.location.pathname === "/game"
						? "in-game"
						: "online",
			});
		}, 10000);

		socket.on("status", (data) => {
			setClearance((clearance) => {
				return {
					...clearance,
					status: { ...clearance.status, ...data },
				};
			});
		});

		return () => {
			clearInterval(pingInterval);
		};
	}, []);

	const toggleTheme = () => {
		setClearance((clearance) => {
			return {
				...clearance,
				theme: clearance.theme === "light" ? "dark" : "light",
			};
		});
	};

	/**
	 * Get the user's clearance level and store it in the context so it can be used in the whole app
	 */
	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/clearance`,
				{}
			)
			.then((response) => {
				if (!response) {
					throw new Error(
						`This is an HTTP error: The status is : pas bien`
					);
				}
				return response;
			})
			.then((response) => {
				setClearance((clearance) => {
					return {
						...clearance,
						login: response.data.login,
						clearance: response.data.clearance,
					};
				});
			})
			.catch((err) => {
				setClearance((clearance) => {
					return {
						...clearance,
						login: "",
						clearance: 0,
					};
				});
			});
	}, []);

	return (
		<div className={clearance.theme === "light" ? style.light : style.dark}>
			<UserContext.Provider
				value={{ ...clearance, toggleTheme: toggleTheme }}
			>
				<Routage />
			</UserContext.Provider>
		</div>
	);
};

export default App;
