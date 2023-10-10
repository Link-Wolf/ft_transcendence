import axios from "axios";
import { useEffect, useState } from "react";
import style from "../style/Game.module.scss";
import load from "../assets/load.gif";

const Login = () => {
	/**
	 * Login component
	 */
	const code = new URLSearchParams(window.location.search).get("code");

	const [done, setDone] = useState(false);
	const [data, setData] = useState<any>();

	/**
	 * If the user is not logged in, redirect him to the 42 intra login page
	 */
	useEffect(() => {
		if (!code) {
			window.location.href =
				`https://api.intra.42.fr/oauth/authorize?` +
				`client_id=${process.env.REACT_APP_INTRA_UID}&` +
				`redirect_uri=${encodeURIComponent(
					String(process.env.REACT_APP_INTRA_REDIRECT)
				)}&` +
				`response_type=code`;
		}

		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/login`,
				{
					params: {
						code: code,
					},
				}
			)
			.then((res) => {
				setData(res.data);
			})
			.catch((error) => {
				setData({ error: error });
			})
			.finally(() => {
				setDone(true);
			});
	}, [code]);

	/**
	 * If it's the first time the user is logging in, redirect him to his profile update page
	 * Else, if the user is connected, redirect him to the home page
	 */
	useEffect(() => {
		if (!done) return;
		if (data.error) return;
		if (data.needTFA) {
			window.location.href = `/tfa/${data.login}`;
			return;
		}
		if (data.firstConnection) {
			window.location.href = `/profile/${data.login}`;
			return;
		}
		window.location.href = "/";
	}, [done, data]);

	if (!done)
		return (
			<>
				<div className={style.playsearch}>
					<img alt='' src={load} className={style.load}></img>
					<p>Loading...</p>
				</div>
			</>
		);
	return <></>;
};

export default Login;
