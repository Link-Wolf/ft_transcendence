import Loading from "./Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import socket from "../socket";
import Cookies from "js-cookie";

const CreateGame = () => {
	//TODO: take invite in account
	const [searchParam] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		let modifiers = searchParam.get("modifiers") as
			| string
			| null
			| number[];
		let isRanked = searchParam.get("isRanked") as string | null | boolean;

		if (modifiers)
			modifiers = (modifiers as string)
				.split(",")
				.map((modifier: string) => parseInt(modifier));
		else modifiers = [];

		if (isRanked) isRanked = isRanked === "true";
		else isRanked = false;

		socket.emit(
			"createGame",
			{
				modifierIds: modifiers,
				isRanked: isRanked,
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
