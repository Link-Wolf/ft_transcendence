

export class BanDto
{
    @IsNum
    id: number;
    reason: string;
    date: Date;
    user?: UserDto;
    channel?: ChannelDto;
}