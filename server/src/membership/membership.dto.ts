import { IsBoolean, IsNumber } from 'class-validator';

export class MembershipDto {
    @IsNumber()
    id?: number;

    @IsBoolean()
    isAdmin: boolean;

    user: Object | string;

    channel: Object | string;
}