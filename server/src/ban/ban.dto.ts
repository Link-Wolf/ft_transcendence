import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class BanDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsDate()
    date: Date;

    user: Object | string;
    channel: Object | string;
}