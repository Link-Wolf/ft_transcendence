import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import Header from "./Header";
import Login from "./Login";
import ThereIsNoFuckingPageBro from "./ThereIsNoFuckingPageBro";
import Chat from "./Chat";
import Game from "./Game";
import Update from "./Update";
import TFA from "./TFA";
import CreateGame from "./CreateGame";
import { useEffect, useState } from "react";
import socket from "../socket";
import Cookies from "js-cookie";

const RouteWatcher = ({ children }: { children: JSX.Element[] }) => {
	const location = useLocation();
	const [oldLocation, setOldLocation] = useState(location.pathname);

	useEffect(() => {
		if (location.pathname === oldLocation)
			if (
				oldLocation.startsWith("/game") &&
				!location.pathname.startsWith("/game")
			) {
				socket.emit("leaveGame", {
					auth: Cookies.get("token"),
					gameId: oldLocation.split("/")[
						oldLocation.split("/").length - 1
					],
				});
			}
		setOldLocation(location.pathname);
	}, [location.pathname, oldLocation]);

	return <>{children}</>;
};

const Routage = () => {
	/**
	 * Routage of the app
	 */
	return (
		<BrowserRouter>
			<RouteWatcher>
				<Header />
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/profile/:login' element={<Profile />} />
					<Route path='/login' element={<Login />} />
					<Route path='/me/update' element={<Update />} />
					<Route path='/game/:id' element={<Game />} />
					<Route path='/game' element={<CreateGame />} />
					<Route path='/tfa/:login' element={<TFA />} />
					<Route path='*' element={<ThereIsNoFuckingPageBro />} />
				</Routes>
				<Chat />
			</RouteWatcher>
		</BrowserRouter>
	);
};

export default Routage;
