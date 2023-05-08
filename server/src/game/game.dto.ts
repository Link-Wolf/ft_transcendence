import { IsBoolean, IsNumber } from 'class-validator';

export class GameDto {
    @IsNumber()
    id?: number;

    @IsBoolean()
    isRanked: boolean;

    userGames: Object[] | string[];

    modifiers: Object[] | string[];
}