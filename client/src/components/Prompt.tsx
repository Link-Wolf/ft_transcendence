import { createContext, useContext, useState } from "react";
import PopUp from "./PopUp";

const PromptContext = createContext({
	prompt: {
		prompt: "t",
		isOpen: false,
		proceed: null as Function | null,
		cancel: null as Function | null,
	},
	setPrompt: (() => {}) as Function,
});

export const PromptProvider = ({ children }: { children: React.ReactNode }) => {
	const [prompt, setPrompt] = useState({
		prompt: "tt",
		isOpen: false,
		proceed: null,
		cancel: null,
	});

	return (
		<PromptContext.Provider value={{ prompt, setPrompt }}>
			{children}
		</PromptContext.Provider>
	);
};

export const usePrompt = () => {
	const { prompt, setPrompt } = useContext(PromptContext);

	const password = (_prompt: string) => {
		const promise = new Promise((resolve, reject) => {
			setPrompt({
				prompt: _prompt,
				isOpen: true,
				proceed: resolve,
				cancel: reject,
				userInput: "",
			});
		});
		const reset = () => {
			console.log("reset");
			setPrompt({
				prompt: "",
				isOpen: false,
				proceed: null,
				cancel: null,
				userInput: "",
			});
		};
		return promise.then(
			(pwd: unknown) => {
				reset();
				return pwd as string;
			},
			() => {
				reset();
				return null;
			}
		);
	};

	return {
		password,
	};
};

export const PromptModal = () => {
	const context = useContext(PromptContext);
	const [pwd, setPwd] = useState("");

	if (!context.prompt.cancel || !context.prompt.proceed) return <></>;

	return (
		<>
			{context.prompt.isOpen && (
				<PopUp
					setPopup={() => {
						(context.prompt.cancel as Function)();
					}}
				>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							(context.prompt.proceed as Function)(pwd);
							setPwd("");
						}}
					>
						<input
							type='password'
							value={pwd}
							onChange={(e) => {
								setPwd(e.target.value);
							}}
						/>
						<button type='submit'>Submit</button>
					</form>
				</PopUp>
			)}
		</>
	);
};
