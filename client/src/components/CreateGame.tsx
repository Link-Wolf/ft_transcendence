import Loading from "./Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import socket from "../socket";
import Cookies from "js-cookie";

const CreateGame = () => {
	const [searchParam] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		let modifiers = searchParam.get("modifiers") as string | null | number[];
		let ranked = searchParam.get("ranked") as string | null | boolean;

		if (modifiers)
			modifiers = (modifiers as string)
				.split(",")
				.map((modifier: string) => parseInt(modifier));

		if (ranked) ranked = ranked === "true";
		else ranked = false;

		socket.emit(
			"createGame",
			{
				modifiersIds: modifiers,
				ranked: ranked,
				auth: Cookies.get("token"),
			},
			(gameId: number, error: any) => {
				if (error) console.log(error);
				else navigate(`/game/${gameId}`);
			}
		);
	}, [searchParam]);

	return <Loading />;
};

export default CreateGame;
