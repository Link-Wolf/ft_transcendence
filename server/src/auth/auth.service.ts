import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { createCanvas, loadImage } from 'canvas';
import { User } from 'src/user/user.entity';
const axios = require('axios');
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	/**
	 * @brief Get the intra user from the code given by intra
	 * @param {string} code Code given by intra
	 * @returns {Object} Intra user
	 * @response 200 - OK
	 * @response 500 - Internal server error
	 */
	async getIntraUser(code: string): Promise<any> {
		let intraUser = await axios
			.post(`https://api.intra.42.fr/oauth/token`, {
				grant_type: 'authorization_code',
				code: code,
				client_id: process.env.REACT_APP_INTRA_UID,
				client_secret: process.env.INTRA_SECRET,
				redirect_uri:
					`${process.env.REACT_APP_PROTOCOL}://` +
					`${process.env.REACT_APP_HOSTNAME}:` +
					`${process.env.REACT_APP_FRONTEND_PORT}/login`,
			})
			.then((response) => {
				return axios
					.get(`https://api.intra.42.fr/v2/me`, {
						headers: {
							Authorization: `Bearer ${response.data.access_token}`,
						},
					})
					.then((response) => {
						return response.data;
					})
					.catch((error) => {
						throw new HttpException(
							'Internal Server Error',
							HttpStatus.INTERNAL_SERVER_ERROR,
						);
					});
			})
			.catch((error) => {
				throw new HttpException(
					'Internal Server Error',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			});
		return intraUser;
	}

	async generateProfilePicture(): Promise<string> {
		let pp: string;

		await axios
			.get(`https://thispersondoesnotexist.com/`, {
				responseType: 'arraybuffer',
			})
			.then(async (res) => {
				const buffer = Buffer.from(res.data);
				const image = await loadImage(buffer);
				const canvas = createCanvas(500, 500);
				canvas.getContext('2d').drawImage(image, 0, 0, 500, 500);
				pp = canvas.toDataURL().split(',')[1];
			})
			.catch((err) => {
				console.log(err);
			});
		return pp;
	}

	async generateName(): Promise<string> {
		let name: string;

		do {
			name = '';
			const lenght = Math.floor(Math.random() * 9) + 8; // Random length between 8 and 16

			for (let i = 0; i < lenght; i++) {
				const nextChar = Math.floor(Math.random() * 26) + 97; // ASCII code for lowercase 'a' to 'z'
				name += String.fromCharCode(nextChar);
			}
		} while (await this.userService.findByName(name));
		return name;
	}

	async verify(token: string): Promise<User> {
		//COMBAK: move this shit to user cause WE ARE A FUCKING CIRCUS
		const { login, needTFA } = await jwt.verify(
			token,
			process.env.JWT_SECRET,
		);
		if (needTFA) return null;
		return await this.userService.findByLogin(login);
	}
}
