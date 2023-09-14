import axios from "axios";
import Routage from "./components/Routage";
import { createContext, useEffect, useState } from "react";
import style from "./style/App.module.scss";
import socket from "./socket";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { use } from "matter-js";

export const UserContext = createContext({
	login: "",
	clearance: 0,
	theme: "light",
	toggleTheme: () => {},
	chat: false,
	setChat: (() => {}) as any,
	channel: null as null | string,
	setChannel: (() => {}) as any,
});

const App = () => {
	const [update, setUpdate] = useState(true);
	const [hasAnimation, setHasAnimation] = useState(false);
	const [chat, setChat] = useState(false);
	const [channel, setChannel] = useState<string | null>(null);
	const [clearance, setClearance] = useState({
		login: "",
		name: "",
		clearance: 0,
		theme: localStorage.getItem("theme") || "light",
	});

	useEffect(() => {
		const theme = localStorage.getItem("theme");
		if (theme) {
			setHasAnimation(false);
			let light = document.getElementById("light");
			if (!light) return;
			if (theme === "dark") {
				light.style.opacity = "0";
			}
		}

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
		setHasAnimation(true);
		let light = document.getElementById("light");
		if (light) {
			if (clearance.theme === "light") light.style.opacity = "0";
			else light.style.opacity = "1";
		}
		localStorage.setItem(
			"theme",
			clearance.theme === "light" ? "dark" : "light"
		);
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
			<div
				id='light'
				className={`${style.light} ${hasAnimation && style.animation}`}
			></div>
			<div className={style.container}>
				<UserContext.Provider
					value={{
						...clearance,
						toggleTheme: toggleTheme,
						chat: chat,
						setChat: setChat,
						channel: channel,
						setChannel: setChannel,
					}}
				>
					<Routage />
				</UserContext.Provider>
			</div>
		</>
	);
};

export default App;
