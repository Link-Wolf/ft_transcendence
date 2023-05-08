import { IsNumber } from 'class-validator';

export class UserGameDto {
    @IsNumber()
    id?: number;

    @IsNumber()
    score: number;

    user: Object | string;
    game: Object | string;
}