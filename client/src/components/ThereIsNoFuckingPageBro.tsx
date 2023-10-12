import style from "../style/App.module.scss";
import errorpng from "../assets/404.png";


const ThereIsNoFuckingPageBro = () => {
	/*
	 * 404 Page
	 */
	return (
		<>
			<div className={style.errorpage}>
				<img
					alt=''
					src={errorpng}
				></img>
				<pre>P I N G ... B U T ... W H E R E   I S   P O N G ?</pre>
			</div>
		</>
	);
};

export default ThereIsNoFuckingPageBro;
