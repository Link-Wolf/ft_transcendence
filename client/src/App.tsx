import axios from "axios";
import "./style/App.scss";
import Routage from "./components/Routage";
import { createContext, useEffect, useState } from "react";
import socket from "./socket";

export const UserContext = createContext({ login: "", clearance: 0 });

const App = () => {
	const [clearance, setClearance] = useState({ login: "", clearance: 0 });
	const [isConnected, setIsConnected] = useState(socket.connected);

	/**
	 * Get the user's clearance level and store it in the context so it can be used in the whole app
	 */
	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/auth/clearance`, {})
			.then((response) => {
				if (!response) {
					throw new Error(
						`This is an HTTP error: The status is : pas bien`
					);
				}
				return response;
			})
			.then((response) => {
				setClearance(response.data);
			})
			.catch((err) => {
				setClearance({ login: "", clearance: 0 });
			});
	}, []);

	useEffect(() => {
		function onConnect() {
			setIsConnected(true);
		}

		function onDisconnect() {
			setIsConnected(false);
		}

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
		};
	}, []);

	return (
		<UserContext.Provider value={clearance}>
			{/* {(() => {
				console.log("YAY YAY BAGUETTE", clearance);
				return <></>;
			})()} */}
			<Routage />
		</UserContext.Provider>
	);
};

export default App;
