import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Modifier } from 'src/modifier/modifier.entity';
import { UserGame } from 'src/user-game/user-game.entity';

export class GameDto {
    @IsNumber()
    id?: number;

    @IsBoolean()
    isRanked: boolean;

    @IsString()
    @IsNotEmpty()
    status: string;

    userGames: UserGame[];

    modifiers: Modifier[];
}