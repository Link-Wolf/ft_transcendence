import Loading from "./Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import socket from "../socket";
import Cookies from "js-cookie";

const CreateGame = () => {
	const [searchParam] = useSearchParams();
	const navigate = useNavigate();

	useEffect(() => {
		let modifiers = searchParam.get("modifiers") as
			| string
			| null
			| number[];
		let isRanked = searchParam.get("isRanked") as string | null | boolean;
		let invitee = searchParam.get("invitee") as string | null;

		if (modifiers)
			modifiers = (modifiers as string)
				.split(",")
				.map((modifier: string) => parseInt(modifier));
		else modifiers = [];

		if (isRanked) isRanked = isRanked === "true";
		else isRanked = false;

		if (invitee) {
			invitee = invitee as string;
			isRanked = false;
			socket.emit(
				"invitePlayer",
				{
					invitee: invitee,
					modifierIds: modifiers,
					auth: Cookies.get("token"),
				},
				(gameId: number, error: any) => {
					if (error) // console.log(error);
					else navigate(`/game/${gameId}`);
				}
			);
			return;
		}

		socket.emit(
			"createGame",
			{
				modifierIds: modifiers,
				isRanked: isRanked,
				auth: Cookies.get("token"),
			},
			(gameId: number, error: any) => {
				if (error) // console.log(error);
				else navigate(`/game/${gameId}`);
			}
		);
	}, [searchParam]);

	return <Loading />;
};

export default CreateGame;
