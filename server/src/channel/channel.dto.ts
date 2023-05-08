import { IsBoolean, IsString, IsNotEmpty } from 'class-validator';

export class ChannelDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    password?: string;

    @IsBoolean()
    isPrivate: boolean;

    owner: Object | string;
    messages?: Object[] | string[];
    memberships?: Object[] | string[];
    mutes?: Object[] | string[];
    bans?: Object[] | string[];
}