import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { Ban } from 'src/ban/ban.entity';
import { Membership } from 'src/membership/membership.entity';
import { Message } from 'src/message/message.entity';
import { Mute } from 'src/mute/mute.entity';
import { User } from 'src/user/user.entity';

export class ChannelDto {
	@IsString()
	@IsNotEmpty()
	name?: string;

	@IsString()
	@IsNotEmpty()
	password?: string;

	@IsBoolean()
	isPrivate?: boolean;

	owner?: User;
	messages?: Message[];
	memberships?: Membership[];
	mutes?: Mute[];
	bans?: Ban[];
}
