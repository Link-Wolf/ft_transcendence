import { IsBoolean, IsNumber, IsDateString } from 'class-validator';
import { Channel } from 'src/channel/channel.entity';
import { User } from 'src/user/user.entity';

export class MembershipDto {
    @IsNumber()
    id?: number;

    @IsBoolean()
    isAdmin?: boolean;

    user?: User;

    channel?: Channel;
}