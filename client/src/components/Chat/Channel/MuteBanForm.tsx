import axios from "axios";
import { useState } from "react";
import socket from "../../../socket";

const MuteBanForm = ({
	channel,
	login,
	boxType,
	setIsToggleBox,
	setToggleAdminBox,
	setUserStatus,
	kick,
}: {
	channel: string;
	login: any;
	boxType: "" | "mute" | "ban";
	setIsToggleBox: Function;
	setToggleAdminBox: Function;
	setUserStatus: Function;
	kick: Function;
}) => {
	const [adminForm, setAdminForm] = useState<any>({
		login: login,
		reason: "",
		duration: 0,
	});

	const handleFormChange = (e: any) => {
		setAdminForm((adminForm: any) => ({
			...adminForm,
			[e.target.name]: e.target.value,
		}));
	};

	const muteSomeone = async (login: string) => {
		await axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute/user/${login}/channel/${channel}`
			)
			.then((res) => {
				if (res.data.length === 0) {
					axios
						.post(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/mute`,
							{
								login: adminForm.login,
								chann_name: channel,
								reason: adminForm.reason,
								end:
									adminForm.duration * 60 * 1000 + Date.now(),
							}
						)
						.then(() => {
							setIsToggleBox(false);
							setToggleAdminBox({
								isActive: false,
								type: "",
							});
							setUserStatus({
								isMuted: true,
							});
							socket.emit("newMessageDaddy", {
								channel: channel,
							});
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const ban = async (login: string) => {
		await axios
			.get(
				`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/ban/user/${login}/channel/${channel}`
			)
			.then((res) => {
				if (res.data.length === 0) {
					axios
						.post(
							`${process.env.REACT_APP_PROTOCOL}://${process.env.REACT_APP_HOSTNAME}:${process.env.REACT_APP_BACKEND_PORT}/api/ban`,
							{
								login: adminForm.login,
								chann_name: channel,
								reason: adminForm.reason,
							}
						)
						.then(() => {
							setIsToggleBox(false);
							setToggleAdminBox({
								isActive: false,
								type: "",
							});
						})
						.then(() => {
							kick(login);
						})
						.catch((err) => {
							console.log(err);
						});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<div /*RELATIVE */>
			<div>{/* FIXED INFINITE */}</div>
			<div /* ignore sa petite soeur*/>
				<form>
					{boxType === "mute" && (
						<select
							value={adminForm.duration}
							onChange={handleFormChange}
						>
							<option value={0} disabled>
								Choisis la duree du mute
							</option>
							<option value={5}>5 minutes</option>
							<option value={10}>10 minutes</option>
							<option value={30}>30 minutes</option>
							<option value={60}>1 heure</option>
							<option value={12 * 60}>12 heures</option>
							<option value={24 * 60}>24 heures</option>
							<option
								value={
									(0.00000036 * 40 * 7 * 3 * 1 * 2 * 10) ^ 8
								}
							>
								bcp jours
							</option>
						</select>
					)}
					<input
						value={adminForm.reason}
						name='reason'
						placeholder='why tho ?'
						onChange={handleFormChange}
					/>
					<button
						type='button'
						onClick={() => {
							boxType === "mute"
								? muteSomeone(login)
								: ban(login);
						}}
					>
						{boxType === "mute"
							? "Censor him"
							: "Apply the banhammer"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default MuteBanForm;
