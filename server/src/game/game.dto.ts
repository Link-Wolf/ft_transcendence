import { IsBoolean, IsNumber } from 'class-validator';
import { Modifier } from 'src/modifier/modifier.entity';
import { UserGame } from 'src/user-game/user-game.entity';

export class GameDto {
    @IsNumber()
    id?: number;

    @IsBoolean()
    isRanked: boolean;

    userGames: UserGame[];

    modifiers: Modifier[];
}