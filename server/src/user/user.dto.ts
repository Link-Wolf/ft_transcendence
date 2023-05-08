import { IsNotEmpty, IsString, IsBoolean } from "class-validator";

export class UserDto {
    @IsString()
    @IsNotEmpty()
    login: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    avatar?: Buffer;

    @IsBoolean()
    has2AF: boolean;

    userGames?: Object;

    messages?: Object;

    memberships?: Object;

    mutes?: Object;

    bans?: Object;

    channelsOwned?: Object;
}