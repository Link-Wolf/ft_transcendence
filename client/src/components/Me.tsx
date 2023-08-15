import { useContext } from "react";
import { UserContext } from "../App";
import Profile from "../components/Profile";

const Me = () => {
	const user = useContext(UserContext);

	return <Profile profileLogin={user.login} />;
};

export default Me;
