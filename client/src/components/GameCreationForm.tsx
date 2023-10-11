import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import style from "../style/Game.module.scss";

const GameCreationForm = ({ opponentLogin }: { opponentLogin?: string }) => {
	const [modifiers, setModifiers] = useState<any[]>([]);
	const [selectedModifiers, setSelectedModifiers] = useState<number[]>([]);
	const [selectedMap, setSelectedMap] = useState(-1);
	const [isRanked, setIsRanked] = useState(false);
	const map = useMemo(() => {
		if (modifiers.length || isRanked) return "ranked";
		return (
			(modifiers.filter((m) => m.id === selectedMap)[0]
				?.code as string) ?? "default"
		);
	}, [selectedMap, modifiers]);

	const selectedStyle = {
		fontWeight: "bold",
		color: "green",
	};
	const unselectedStyle = {
		fontWeight: "normal",
	};

	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsVisible(true);
		}, 0);
	}, []);

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
				console.log(err);
			});
	}, []);

	var selecMap = "default";
	modifiers
		.filter((mod) => mod.code.startsWith("map_"))
		.map((modifier, i) => {
			if (selectedMap === modifier.id) selecMap = modifier.code;
		});

	return (
		<>
			<div
				className={`${style.gameCreationForm} ${
					isVisible && style.show
				}`}
			>
				<h1>GAME CREATION </h1>
				<div className={style.display}>
					<div className={style.preview}>
						{selecMap === "default" || isRanked ? (
							<div className={style.gamemapDefault}></div>
						) : selecMap === "map_1" ? (
							<div className={style.gamemapCube}></div>
						) : selecMap === "map_2" ? (
							<div className={style.gamemapLine}></div>
						) : (
							<div className={style.gamemapTwin}></div>
						)}
					</div>
					<div>
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
							<label data-tooltip-id={"ranked"}>❔</label>
							<Tooltip id={"ranked"}>
								A ranked game is a game without modifier whose
								results are taken into account in the ranking
							</Tooltip>
						</label>

						{!isRanked && (
							<>
								<hr />

								{modifiers
									.filter(
										(mod) => !mod.code.startsWith("map_")
									)
									.map((modifier, i) => (
										<label
											className={style.gameselect}
											key={i}
											style={
												selectedModifiers.includes(
													modifier.id
												)
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
																	(e) =>
																		e !==
																		modifier.id
																)
															);
														else {
															setSelectedModifiers(
																(
																	selectedModifiers
																) => [
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
												data-tooltip-id={
													"modifier" + modifier.code
												}
											>
												❔
											</label>
											<Tooltip
												id={"modifier" + modifier.code}
											>
												{modifier.desc}
											</Tooltip>
										</label>
									))}

								<hr />

								<label
									className={style.gameselect}
									style={
										selectedMap === -1
											? selectedStyle
											: unselectedStyle
									}
								>
									<label>
										<input
											type='radio'
											name='map'
											checked={selectedMap === -1}
											onChange={(e: any) => {
												if (e.target.checked)
													setSelectedMap(-1);
											}}
										/>
										Default Map
									</label>
									<label data-tooltip-id={"default map"}>
										❔
									</label>
									<Tooltip id={"default map"}>
										Default map, without any obstacle
									</Tooltip>
								</label>
								{modifiers
									.filter((mod) =>
										mod.code.startsWith("map_")
									)
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
													checked={
														selectedMap ===
														modifier.id
													}
													onChange={(e: any) => {
														if (e.target.checked)
															setSelectedMap(
																modifier.id
															);
													}}
												/>
												{modifier.name}
											</label>
											<label
												data-tooltip-id={
													"modifier" + modifier.code
												}
											>
												❔
											</label>
											<Tooltip
												id={"modifier" + modifier.code}
											>
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
							}${
								opponentLogin ? `&invitee=${opponentLogin}` : ""
							}`}
						>
							<button className={style.button}>
								{opponentLogin ? "Invite" : "Create Game"}
							</button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};

export default GameCreationForm;
