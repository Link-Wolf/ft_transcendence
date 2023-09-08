import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import style from "../style/Game.module.scss";


const GameSelection = ({ opponentLogin }: { opponentLogin?: string }) => {
	const [modifiers, setModifiers] = useState<any[]>([]);
	const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);

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
			{modifiers.map((modifier, i) => (
				<label className={style.gameselect}
					key={i}
					style={{
						fontWeight: selectedModifiers.includes(modifier.code)
							? "bold"
							: "normal",
						color: selectedModifiers.includes(modifier.code)
							? "green"
							: "black",
					}}
				>
					<input 
						type='checkbox'
						checked={selectedModifiers.includes(modifier.code)}
						onChange={() => {
							if (selectedModifiers.includes(modifier.code))
								setSelectedModifiers(
									selectedModifiers.filter(
										(e) => e !== modifier.code
									)
								);
							else {
								if (modifier.code.startsWith("map_"))
									setSelectedModifiers((selectedModifiers) =>
										selectedModifiers.filter(
											(e) => !e.startsWith("map_")
										)
									);
								setSelectedModifiers((selectedModifiers) => [
									...selectedModifiers,
									modifier.code,
								]);
							}
						}}
					/>
					{modifier.name}
					<label data-tooltip-id={"modifier" + i}>?</label>
					<Tooltip id={"modifier" + i}>{modifier.desc}</Tooltip>
				</label>
			))}

			{/* Depending of if there is a given login (so if it's a friendly match) do something different to manage the game */}
			<Link to='/game'><button className={style.button}>Play</button></Link>
		</>
	);
};

export default GameSelection;
