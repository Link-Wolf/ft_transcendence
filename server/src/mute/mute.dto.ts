import { IsNumber, IsString, IsDate, IsNotEmpty } from 'class-validator';

export class MuteDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsDate()
    end: Date;

    user: Object | string;
    channel: Object | string;
}