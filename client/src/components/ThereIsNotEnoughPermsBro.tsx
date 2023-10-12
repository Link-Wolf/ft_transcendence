import style from "../style/App.module.scss";
import errorpng from "../assets/401.png";


const ThereIsNotEnoughPermsBro = () => {
	/**
	 * 401/403 Page
	 */
	return (
		<>
			<div className={style.errorpage}>
				<img
					alt=''
					src={errorpng}></img>
				<pre>A U T H O R I Z A T I O N    R E Q U I R E D</pre>
			</div>
		</>
	);
};

export default ThereIsNotEnoughPermsBro;
