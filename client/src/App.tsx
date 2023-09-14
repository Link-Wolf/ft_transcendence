import axios from "axios";
import Routage from "./components/Routage";
import { createContext, useEffect, useState } from "react";
import style from "./style/App.module.scss";
import socket from "./socket";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";

export const UserContext = createContext({
	login: "",
	clearance: 0,
	theme: "light",
	toggleTheme: () => {},
});

const App = () => {
	const [update, setUpdate] = useState(true);
	const [clearance, setClearance] = useState({
		login: "",
		name: "",
		clearance: 0,
		theme: "light",
	});

	useEffect(() => {
		socket.on("connect", () => {
			socket.emit("log", {
				auth: Cookies.get("token"),
			});
		});

		const emitBlur = () => {
			socket.emit("blur", {
				auth: Cookies.get("token"),
			});
		};

		const emitFocus = () => {
			socket.emit("focus", {
				auth: Cookies.get("token"),
			});
		};

		window.addEventListener("blur", emitBlur);

		window.addEventListener("focus", emitFocus);

		return () => {
			socket.off("connect");
			window.removeEventListener("blur", emitBlur);
			window.removeEventListener("focus", emitFocus);
		};
	}, []);

	const toggleTheme = () => {
		let light = document.getElementById("light");
		if (light) {
			if (clearance.theme === "light") light.style.opacity = "0";
			else light.style.opacity = "1";
		}
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
		if (!update) return;
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
						name: response.data.name,
						clearance: response.data.clearance,
					};
				});
				setUpdate(false);
			})
			.catch((err) => {
				setClearance((clearance) => {
					return {
						...clearance,
						login: "",
						name: "",
						clearance: 0,
					};
				});
			});
	}, [update]);

	return (
		<>
			<div id='dark' className={style.dark}></div>
			<div id='light' className={style.light}></div>
			<div>
				<UserContext.Provider
					value={{ ...clearance, toggleTheme: toggleTheme }}
				>
					<Routage />
				</UserContext.Provider>
			</div>
		</>
	);
};

export default App;
