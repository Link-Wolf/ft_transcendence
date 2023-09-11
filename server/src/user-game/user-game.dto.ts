import { IsNumber } from 'class-validator';
import { Game } from 'src/game/game.entity';
import { User } from 'src/user/user.entity';

  export class UserGameDto {
    @IsNumber()
    score?: number;

    user?: User;
    game?: Game;
}