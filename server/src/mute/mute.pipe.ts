import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
    transform(value: string): Date {
        const parsedDate = new Date(value);
        if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException('Invalid date');
        }
        return parsedDate;
    }
}