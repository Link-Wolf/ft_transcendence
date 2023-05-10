import { UserGame } from "./user-game.entity";

export const userGameProviders = [
    {
        provide: 'USER_GAME_REPOSITORY',
        useValue: UserGame,
    },
];