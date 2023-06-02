import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';
import { Channel } from 'src/channel/channel.entity';
import { User } from 'src/user/user.entity';

export class MessageDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    content?: string;

    @IsDate()
    date?: Date;

    user?: User;

    channel?: Channel;
}