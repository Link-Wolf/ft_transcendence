import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTService {
	async tokenise(payload: any) {
		return jwt.sign(payload, process.env.JWT_KEY, {
			expiresIn: 1000 * 60 * 60 * 24 * 7,
		});
	}
}
