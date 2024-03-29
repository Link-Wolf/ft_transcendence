import { useEffect } from "react";
import style from "../style/PopUp.module.scss";

const PopUp = ({
	children,
	setPopup,
}: {
	children?: (JSX.Element | false)[] | JSX.Element | false;
	setPopup: Function;
}) => {
	useEffect(() => {
		window.addEventListener("click", (ev: MouseEvent) => {
			// check if clicking on background
			if (
				(ev.target as HTMLElement).classList.contains(
					style.popupContainer
				)
			) {
				setPopup("");
			}
		});
	}, [setPopup]);

	return (
		<div className={style.popupContainer}>
			<div className={style.popup}>{children}</div>
		</div>
	);
};

export default PopUp;
