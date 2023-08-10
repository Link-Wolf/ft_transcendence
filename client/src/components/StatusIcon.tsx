import { useContext } from "react";
import { UserContext } from "../App";

const checkStatus = (login: string) => {
	const status = useContext(UserContext).status;

	if (status[login] === undefined) return "offline";
	return status[login].status;
};

const StatusIcon = ({ login }: { login: string }) => {
	if (checkStatus(login) === "offline") return <div>offline</div>;
	if (checkStatus(login) === "online") return <div>online</div>;
	if (checkStatus(login) === "playing") return <div>playing</div>;
};

export default StatusIcon;
export { checkStatus, StatusIcon };
