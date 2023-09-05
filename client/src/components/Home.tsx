import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { PPDisplayer } from "./ImageDisplayer";
import axios from "axios";

const Home = () => {
	/**
	 * Home page, display a link to the game page if the user is logged in, or a link to the login page if the user is not logged in
	 */

	const user = useContext(UserContext);
	const [chooseMode, setChooseMode] = useState(false);
	const [modifiers, setModifiers] = useState<any[]>([]);
	const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/modifier`
			)
			.then((res) => {
				setModifiers(res.data);
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<div>
			<h1>Home</h1>
			<p>Home page buddy</p>
			{user.clearance > 0 ? (
				<>
					{!chooseMode && (
						<button
							type='button'
							onClick={() => {
								setChooseMode(true);
							}}
						>
							Start a game
						</button>
					)}
					{chooseMode && (
						<>
							<img src='https://media.giphy.com/media/3o7aDcz6Y0fzWYvU5G/giphy.gif' />
							{modifiers.map((modifier, i) => (
								<button
									type='button'
									key={i}
									onClick={() => {
										if (
											selectedModifiers.includes(
												modifier.code
											)
										)
											setSelectedModifiers(
												selectedModifiers.filter(
													(e) => e !== modifier.code
												)
											);
										else {
											if (
												modifier.code.startsWith("map_")
											)
												setSelectedModifiers(
													(selectedModifiers) =>
														selectedModifiers.filter(
															(e) =>
																!e.startsWith(
																	"map_"
																)
														)
												);
											setSelectedModifiers(
												(selectedModifiers) => [
													...selectedModifiers,
													modifier.code,
												]
											);
										}
									}}
								>
									{modifier.name}
									{selectedModifiers.includes(
										modifier.code
									) && "✅"}
								</button>
							))}
							<Link to='/game'>Play</Link>
						</>
					)}
				</>
			) : (
				<Link
					to={
						`https://api.intra.42.fr/oauth/authorize?` +
						`client_id=${process.env.REACT_APP_INTRA_UID}&` +
						`redirect_uri=${encodeURIComponent(
							`${process.env.REACT_APP_PROTOCOL}://` +
								`${process.env.REACT_APP_HOSTNAME}:` +
								`${process.env.REACT_APP_FRONTEND_PORT}/login`
						)}&` +
						`response_type=code`
					}
				>
					Connect to play
				</Link>
			)}
		</div>
	);
};

export default Home;
