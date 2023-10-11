import style from "../style/App.module.scss";

const ThereIsNotEnoughPermsBro = () => {
	/**
	 * 401/403 Page
	 */
	return (
		<>
			<div className={style.errorpage}>
				<img
					alt=''
					src='https://cdn-bippi.nitrocdn.com/bqwDxSPDRpDwmYRiWNYPrkliEvinJKIP/assets/images/optimized/rev-a9389c0/privateproxy.me/wp-content/uploads/2022/04/810x348-What-is-a-Proxy-Error.png'
				></img>
				<pre>A U T H O R I Z A T I O N    R E Q U I R E D</pre>
			</div>
		</>
	);
};

export default ThereIsNotEnoughPermsBro;
