import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
	/**
	 * Login component
	 */
	const navigate = useNavigate();
	const [done, setDone] = useState(false);
	const [needTFA, setNeedTFA] = useState(false);
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
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/auth/login`,
				{
					params: {
						code: code,
					},
				}
			)
			.then((res) => {
				setNeedTFA(res.data.needToTFA);
				setIsFirstTime(res.data.status === "registered");
				setIsConnected(!res.data.needToTFA);
			})
			.catch((error) => {
				setErrorCode(500);
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
		if (errorCode > 0) {
			navigate(`/error/${errorCode}`);
		} else if (isFirstTime) {
			window.location.href = "/me/update";
		} else if (isConnected) {
			window.location.href = "/";
		}
	}, [done, errorCode, isFirstTime, isConnected, navigate]);

	if (errorCode > 0) return <p>Something went wrong: {errorCode}</p>;
	if (!done) return <p>Loading...</p>;
	if (needTFA) return <form></form>; // Manage TFA
	return <></>;
};

export default Login;
