import axios from "axios";
import "./style/App.scss";
import Routage from "./components/Routage";
import { ChangeEvent, createContext, useEffect, useState } from "react";
import socket from "./socket";

export const UserContext = createContext({ login: "", clearance: 0 });

const Test = () => {
	const [messages, setMessages] = useState<string[]>([]);
	const [message, setMessage] = useState<string>("");

	const updateMessage = (event: ChangeEvent<HTMLInputElement>) => {
		setMessage(event.target.value);
	};

	const sendMessage = () => {
		socket.emit("msgToServer", message);
		setMessage("");
	};

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Connected to server");
		});
		socket.on("disconnect", () => {
			console.log("Disconnected from server");
		});
		socket.on("msgToClient", (message: string) => {
			setMessages((messages) => [...messages, message]);
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
		};
	}, []);

	return (
		<div className='App'>
			<div
				style={{
					height: "500px",
				}}
			>
				{messages.map((message, index) => (
					<p key={index}>{message}</p>
				))}
			</div>
			<form>
				<input
					type='text'
					value={message}
					onChange={updateMessage}
				/>
				<button
					type='button'
					onClick={sendMessage}
				>
					Send
				</button>
			</form>
		</div>
	);
};

const App = () => {
	const [clearance, setClearance] = useState({ login: "", clearance: 0 });

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
				setClearance(response.data);
			})
			.catch((err) => {
				setClearance({ login: "", clearance: 0 });
			});
	}, []);

	return (
		<UserContext.Provider value={clearance}>
			{/* {(() => {
				console.log("YAY YAY BAGUETTE", clearance);
				return <></>;
			})()} */}
			<Routage />
			<Test />
		</UserContext.Provider>
	);
};

export default App;
