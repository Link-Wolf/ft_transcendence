import { Game } from "./game.entity";

export const gameProviders = [
    {
        provide: 'GAME_REPOSITORY',
        useValue: Game,
    },
];