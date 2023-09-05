import style from "../style/Loading.module.scss";

const Loading = ({ size }: { size?: number }) => {
	return (
		<>
			<div className={style.loaderContainer}>
				<div className={style.spinner}></div>
			</div>
		</>
	);
};

export default Loading;
