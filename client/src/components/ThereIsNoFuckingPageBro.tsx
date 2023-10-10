import style from "../style/App.module.scss";

const ThereIsNoFuckingPageBro = () => {
	/*
	 * 404 Page
	 */
	return (
		<>
			<div className={style.errorpage}>
				<img
					alt=''
					src='https://globalonlinepay.com/assets/images/feature/404.png'
				></img>
				<pre>P I N G ... B U T ... W H E R E I S P O N G ?</pre>
			</div>
		</>
	);
};

export default ThereIsNoFuckingPageBro;
