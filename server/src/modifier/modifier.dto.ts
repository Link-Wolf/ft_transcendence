import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Game } from 'src/game/game.entity';

export class ModifierDto {
	@IsNumber()
	id?: number;

	@IsString()
	@IsNotEmpty()
	code: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	desc: string;

	games?: Game[];
}
