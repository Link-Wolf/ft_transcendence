import GameCreationForm from "./GameCreationForm";
import PlayableGamesList from "./PlayableGamesList";

const GameSelection = () => {
	return (
		<>
			<PlayableGamesList />
			<GameCreationForm />
		</>
	);
};

export default GameSelection;
