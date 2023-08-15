import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import Header from "./Header";
import Login from "./Login";
import ThereIsNoFuckingPageBro from "./ThereIsNoFuckingPageBro";
import Chat from "./Chat";
import Game from "./Game";
import Update from "./Update";

const Routage = () => {
	/**
	 * Routage of the app
	 */
	return (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route
					path='/'
					element={<Home />}
				/>
				<Route
					path='/profile/:login'
					element={<Profile />}
				/>
				<Route
					path='/me/update'
					element={<Update />}
				/>
				<Route
					path='/login'
					element={<Login />}
				/>
				<Route
					path='/game'
					element={<Game />}
				/>

				<Route
					path='*'
					element={<ThereIsNoFuckingPageBro />}
				/>
			</Routes>
			<Chat />
		</BrowserRouter>
	);
};

export default Routage;
