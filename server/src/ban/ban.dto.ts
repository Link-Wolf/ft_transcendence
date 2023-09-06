import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Channel } from 'src/channel/channel.entity';
import { User } from 'src/user/user.entity';

export class BanDto {
	@IsNumber()
	id?: number;

	@IsString()
	@IsNotEmpty()
	reason?: string;

	user?: User;

	channel?: Channel;
}
