import style from "../style/PopUp.module.scss";

const PopUp = ({ children }: { children?: JSX.Element[] | JSX.Element }) => {
	return <div className={style.popup}>{children}</div>;
};

export default PopUp;
