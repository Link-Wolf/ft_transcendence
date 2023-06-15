import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JWTService {
	async tokenise(payload: any) {
		return jwt.sign(
			payload,
			process.env.JWT_KEY,
			{ expiresIn: "2h" }
		);
	}

	async verify(token: string) {
		return jwt.verify(token, process.env.JWT_KEY);
	}
}
