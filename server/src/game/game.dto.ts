import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Modifier } from 'src/modifier/modifier.entity';
import { User } from 'src/user/user.entity';

export class GameDto {
	@IsNumber()
	id?: string;

	@IsBoolean()
	isRanked?: boolean;

	@IsString()
	@IsNotEmpty()
	status?: string;

	users?: User[];

	invitee?: string;

	modifiers?: Modifier[];
}
