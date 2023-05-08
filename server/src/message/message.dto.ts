import { IsString, IsNotEmpty, IsNumber, IsDate } from 'class-validator';

export class MessageDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsDate()
    date: Date;

    user: Object | string;

    channel: Object | string;
}