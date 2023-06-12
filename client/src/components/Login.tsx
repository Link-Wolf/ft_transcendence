import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const wait = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

const Login = () => {
	const navigate = useNavigate();
	const [done, setDone] = useState(false);
	const [needA2F, setNeedA2F] = useState(false);
	const [errorCode, setErrorCode] = useState(0);
	const [isConnected, setIsConnected] = useState(false);
	const [isFirstTime, setIsFirstTime] = useState(false);
	const code = new URLSearchParams(window.location.search).get("code");

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
			.get(`${process.env.REACT_APP_BACKEND_URL}/auth/login`, {
				params: {
					code: code,
				},
			})
			.then((res) => {
				setNeedA2F(res.data.needTo2FA);
				setIsFirstTime(res.data.status === "registered");
				setIsConnected(!res.data.needTo2FA);
			})
			.catch((error) => {
				setErrorCode(500);
			})
			.finally(() => {
				setDone(true);
			});
	}, [code]);

	/**
	 * If it's the first time the user is logging in, redirect him to the profile update page
	 * Else, if the user is connected, redirect him to the home page
	 */
	useEffect(() => {
		if (errorCode > 0) {
			navigate("/error");
		} else if (isFirstTime) {
			navigate("/profile/update");
		} else if (isConnected) {
			navigate("/");
		}
	}, [errorCode, isFirstTime, isConnected, navigate]);

	console.log(done);

	if (errorCode > 0) return <p>Something went wrong: {errorCode}</p>;
	if (!done) return <p>Loading...</p>;
	if (needA2F) return <form></form>; // Manage 2FA
	return <></>;
};

export default Login;
