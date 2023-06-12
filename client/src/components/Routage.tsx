import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Profile from "./Profile";
import Header from "./Header";
import Login from "./Login";
import ThereIsNoFuckingPageBro from "./ThereIsNoFuckingPageBro";

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
					path='/profile'
					element={<Profile />}
				/>
				<Route
					path='/login'
					element={<Login />}
				/>

				<Route
					path='*'
					element={<ThereIsNoFuckingPageBro />}
				/>
			</Routes>
		</BrowserRouter>
	);
};

export default Routage;
