import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import style from "../style/Game.module.scss";

import DefaultSlowSmall from "../assets/GameSelect/Default-slow-small.gif";
import CitySlowSmall from "../assets/GameSelect/City-slow-small.gif";

const GameCreationForm = ({ opponentLogin }: { opponentLogin?: string }) => {
	const [modifiers, setModifiers] = useState<any[]>([]);
	const [selectedModifiers, setSelectedModifiers] = useState<number[]>([]);
	const [selectedMap, setSelectedMap] = useState(-1);
	const [isRanked, setIsRanked] = useState(false);

	const selectedStyle = {
		fontWeight: "bold",
		color: "green",
	};
	const unselectedStyle = {
		fontWeight: "normal",
	};

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/modifier`
			)
			.then((res) => {
				setModifiers(
					res.data.sort(
						(
							a: Required<{ code: string }>,
							b: Required<{ code: string }>
						) => a.code.localeCompare(b.code)
					)
				);
			})
			.catch((err) => {
				// console.log(err)
			});
	}, []);

	// console.log(selectedMap);
	return (
		<>
			{selectedMap === -1 ? (
				<div className={style.gamemapDefault}></div>
			) : selectedMap === 11 ? (
				<div className={style.gamemapTwin}></div>
			) : (
				<div className={style.gamemapLine}></div>
			)}
			<label
				className={style.gameselect}
				style={isRanked ? selectedStyle : unselectedStyle}
			>
				<label>
				<input
					type='checkbox'
					checked={isRanked}
					onChange={() => {
						setIsRanked((isRanked) => !isRanked);
					}}
					/>
				Ranked
				</label>
				<label data-tooltip-id={"ranked"}>💬</label>
				<Tooltip id={"ranked"}>
					Une game ranked est une game sans modifier dont les
					resultats sont pris en compte dans le classement
				</Tooltip>
			</label>

			{!isRanked && (
				<>
					<hr />

					{modifiers
						.filter((mod) => !mod.code.startsWith("map_"))
						.map((modifier, i) => (
							<label
								className={style.gameselect}
								key={i}
								style={
									selectedModifiers.includes(modifier.id)
										? selectedStyle
										: unselectedStyle
								}
								>
								<label>	
								<input
									type='checkbox'
									checked={selectedModifiers.includes(
										modifier.id
									)}
									onChange={() => {
										if (
											selectedModifiers.includes(
												modifier.id
											)
										)
											setSelectedModifiers(
												selectedModifiers.filter(
													(e) => e !== modifier.id
												)
											);
										else {
											setSelectedModifiers(
												(selectedModifiers) => [
													...selectedModifiers,
													modifier.id,
												]
											);
										}
									}}
								/>
								{modifier.name}
								</label>
								<label
									data-tooltip-id={"modifier" + modifier.code}
								>
									💬
								</label>
								<Tooltip id={"modifier" + modifier.code}>
									{modifier.desc}
								</Tooltip>
							</label>
						))}

					<hr />

					<label
						className={style.gameselect}
						style={
							selectedMap === -1 ? selectedStyle : unselectedStyle
						}
					>
						<label>
						<input
							type='radio'
							name='map'
							checked={selectedMap === -1}
							onChange={(e: any) => {
								if (e.target.checked) setSelectedMap(-1);
							}}
							/>
						Default Map
						</label>
						<label data-tooltip-id={"default map"}>💬</label>
						<Tooltip id={"default map"}>Map par defaut</Tooltip>
					</label>
					{modifiers
						.filter((mod) => mod.code.startsWith("map_"))
						.map((modifier, i) => (
							<label
								className={style.gameselect}
								key={i}
								style={
									selectedMap === modifier.id
										? selectedStyle
										: unselectedStyle
								}
							>
								<label>
								<input
									type='radio'
									name='map'
									checked={selectedMap === modifier.id}
									onChange={(e: any) => {
										if (e.target.checked)
										setSelectedMap(modifier.id);
								}}
								/>
								{modifier.name}
								</label>
								<label
									data-tooltip-id={"modifier" + modifier.code}
								>
									💬
								</label>
								<Tooltip id={"modifier" + modifier.code}>
									{modifier.desc}
								</Tooltip>
							</label>
						))}
				</>
			)}

			{/* Depending of if there is a given login (so if it's a friendly match) do something different to manage the game */}
			<Link
				to={`/game?${
					isRanked
						? "isRanked=true"
						: `isRanked=false&modifiers=${[
								selectedMap,
								...selectedModifiers,
						  ]
								.filter((e) => e !== -1)
								.join(",")}`
				}${opponentLogin ? `&invitee=${opponentLogin}` : ""}`}
			>
				<button className={style.button}>
					{opponentLogin ? "Invite" : "Create Game"}
				</button>
			</Link>
		</>
	);
};

export default GameCreationForm;
