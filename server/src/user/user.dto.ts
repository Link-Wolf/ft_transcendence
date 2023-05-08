import { BanDto } from "src/ban/ban.dto";
import { MembershipDto } from "src/membership/membership.dto";
import { MessageDto } from "src/message/message.dto";
import { MuteDto } from "src/mute/mute.dto";
import { UserGameDto } from "src/user-game/user-game.dto";

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

    userGames?: UserGameDto[];

    messages?: MessageDto[];

    memberships?: MembershipDto[];

    mutes?: MuteDto[];

    bans?: BanDto[];
}