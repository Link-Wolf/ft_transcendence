import { IsNotEmpty, IsString, IsBoolean, IsIn } from 'class-validator';
import { Membership } from 'src/membership/membership.entity';
import { Message } from 'src/message/message.entity';
import { UserGame } from 'src/user-game/user-game.entity';
import { Ban } from 'src/ban/ban.entity';
import { Mute } from 'src/mute/mute.entity';
import { Channel } from 'src/channel/channel.entity';

export class UserDto {
	@IsString()
	@IsNotEmpty()
	login?: string;

	@IsString()
	@IsNotEmpty()
	name?: string;

	avatar?: string;

	clearance?: number;

	@IsBoolean()
	hasTFA?: boolean;

	TFASecret?: string;

	userGames?: UserGame[];

	messages?: Message[];

	memberships?: Membership[];

	mutes?: Mute[];

	bans?: Ban[];

	channelsOwned?: Channel[];

	hasConnected?: boolean;

	@IsIn(['online', 'offline', 'ongame'])
	status?: string;

	pongKey?: string;

	pingDelay?: number;

	socketId?: string;
}

