import { useContext, useEffect, useState } from "react";
import socket from "../../../socket";
import { UserContext } from "../../../App";
import axios from "axios";

const GameNotifications = () => {
	const [invatations, setInvatations] = useState([]);
	const [update, setUpdate] = useState(true);
	const user = useContext(UserContext);

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/game/invitations/${user.login}`
			)
			.then((res) => {
				setInvatations(res.data);
			})
			.catch((err) => console.log(err));
	}, [update]);

	return <></>;
};
export default GameNotifications;
