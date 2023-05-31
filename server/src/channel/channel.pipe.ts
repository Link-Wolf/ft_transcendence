import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParsePasswordPipe implements PipeTransform {
    transform(password: string, metadata: ArgumentMetadata) {

        if (password && password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        return password;
    }
}

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