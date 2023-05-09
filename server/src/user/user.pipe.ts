import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
    transform(value: Buffer, metadata: ArgumentMetadata) {
        if (!value) {
            return undefined;
        }
        return value;
    }
}