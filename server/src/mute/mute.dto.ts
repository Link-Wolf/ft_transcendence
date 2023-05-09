import { IsNumber, IsString, IsDate, IsNotEmpty } from 'class-validator';
import { Channel } from 'src/channel/channel.entity';
import { User } from 'src/user/user.entity';

export class MuteDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsDate()
    end: Date;

    user: User;
    channel: Channel;
}