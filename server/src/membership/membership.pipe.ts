import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class ParseBoolPipe implements PipeTransform {
	transform(value: string | boolean, metadata: ArgumentMetadata) {
		if (
			value === true ||
			value === 'true' ||
			value === '1' ||
			value === 't'
		) {
			return true;
		}
		if (
			value === false ||
			value === 'false' ||
			value === '0' ||
			value === 'f'
		) {
			return false;
		}
		return undefined;
	}
}
