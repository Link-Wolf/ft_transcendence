import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';

const Routage = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home/>} />
				<Route path="/profile" element={<Profile/>} />
			</Routes>
		</BrowserRouter>
	);
}

export default Routage;