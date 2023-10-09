import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import GameSelection from "./GameSelection";
import style from "../style/Home.module.scss";
import brand from "../assets/placeholder_logo.png";
import { useNotifications } from "./Notifications";

const Home = () => {
	/**
	 * Home page, display a link to the game page if the user is logged in, or a link to the login page if the user is not logged in
	 */
	const user = useContext(UserContext);
	const notification = useNotifications();
	const [chooseMode, setChooseMode] = useState(false);

	return (
		<div className={style.home}>
			<button onClick={()=>{notification.alert("Alert","Karen was eating the manager")}}>Alert</button>
			<button onClick={()=>{notification.info("Info","Caroline fart in th bocal,but ... SShhhh, She believe who anyone know")}}>Info</button>
			<button onClick={()=>{notification.error("Error"," BURN OUT")}}>Error</button>
			<div id={chooseMode ? style.slide : undefined}>
				<h1 className={style.title}>W E L C O M E</h1>
				<img className={style.brand} src={brand}></img>
				<h1 className={style.subtitle}>P L A T Y P O N G</h1>
			</div>
			{!chooseMode && <p> Ready to play ? </p>}
			{user.clearance > 0 ? (
				<>
					{!chooseMode ? (
						<button
							className={style.playbutton}
							type='button'
							onClick={() => {
								setChooseMode(true);
							}}
						>
							Play
						</button>
					) : (
						<GameSelection />
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
					<button className={style.playbutton}>
						{" "}
						Connect to play{" "}
					</button>
				</Link>
			)}
		</div>
	);
};

export default Home;
