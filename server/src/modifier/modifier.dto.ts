import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ModifierDto {
    @IsNumber()
    id?: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    desc: string;

    games?: Object[];
}