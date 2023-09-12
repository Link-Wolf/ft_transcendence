import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import style from "../style/Game.module.scss";

const GameSelection = ({ opponentLogin }: { opponentLogin?: string }) => {
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
		color: "black",
	};

	useEffect(() => {
		axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/modifier`
			)
			.then((res) => {
				setModifiers(res.data);
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<>
			{/* <img src='https://media.giphy.com/media/3o7aDcz6Y0fzWYvU5G/giphy.gif' /> */}
			<label
				className={style.gameselect}
				style={isRanked ? selectedStyle : unselectedStyle}
			>
				<input
					type='checkbox'
					checked={isRanked}
					onChange={() => {
						setIsRanked((isRanked) => !isRanked);
					}}
				/>
				Ranked
				<label data-tooltip-id={"ranked"}>?</label>
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
								<label
									data-tooltip-id={"modifier" + modifier.code}
								>
									?
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
						<input
							type='radio'
							name='map'
							checked={selectedMap === -1}
							onChange={(e: any) => {
								if (e.target.checked) setSelectedMap(-1);
							}}
						/>
						Default Map
						<label data-tooltip-id={"default map"}>?</label>
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
								<label
									data-tooltip-id={"modifier" + modifier.code}
								>
									?
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
				}`}
			>
				<button className={style.button}>Play</button>
			</Link>
		</>
	);
};

export default GameSelection;
