import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
@Injectable()
export class ParseBoolPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata) {
        if (value === 'true' || value === '1' || value === 't') {
            return true;
        }
        if (value === 'false' || value === '0' || value === 'f') {
            return false;
        }
        return undefined;
    }
}