import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
// const { Image, createCanvas } = require('canvas');
import { createCanvas, loadImage } from 'canvas';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { JWTService } from './jwt.service';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import axios from 'axios';
import * as otplib from 'otplib';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService,
		private jwtService: JWTService,
	) {}

	/**
	 * @brief Login with intra
	 * @param {string} code Code given by intra
	 * @param {Record<string, any>} session Session (redis)
	 * @returns { {
	 * 				status: 'logged' | 'registered',
	 * 				needToTFA: boolean
	 * 		} } Status of the login and if the user enabled TFA
	 * @security Anyone
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 500 - Internal server error
	 */
	@Get('login')
	async intraLogin(
		@Query('code') code: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<{
		status: string;
		needToTFA: boolean;
		login: string;
	}> {
		let status = 'disconnected';
		let intraUser = await this.authService.getIntraUser(code);
		if (!intraUser)
			throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
		let user = await this.userService.findByLogin(intraUser.login);

		// CREATE A NEW USER
		if (!user) {
			status = 'registered';
			let default_avatar_buffer: string;

			await axios
				.get(`https://thispersondoesnotexist.com/`, {
					responseType: 'arraybuffer',
				})
				.then(async (res) => {
					const buffer = Buffer.from(res.data);
					const image = await loadImage(buffer);
					const canvas = createCanvas(500, 500);
					canvas.getContext('2d').drawImage(image, 0, 0, 500, 500);
					default_avatar_buffer = canvas.toDataURL().split(',')[1];
				})
				.catch((err) => {
					console.log(err);
				});

			// generate a random string between 8 and 16 lowercase letters
			let randomString: string;
			do {
				randomString = '';
				const randomStringLength = Math.floor(Math.random() * 9) + 8; // Random length between 8 and 16

				for (let i = 0; i < randomStringLength; i++) {
					const randomCharCode = Math.floor(Math.random() * 26) + 97; // ASCII code for lowercase 'a' to 'z'
					randomString += String.fromCharCode(randomCharCode);
				}
			} while (await this.userService.findByName(randomString));

			user = await this.userService.create({
				login: intraUser.login,
				clearance: Number(process.env.USER_CLEARANCE),
				avatar: default_avatar_buffer,
				name: randomString,
				TFASecret: otplib.authenticator.generateSecret(),
			});
		}

		if (!user.dataValues.hasConnected)
			await this.userService.update({
				login: user.dataValues.login,
				hasConnected: true,
			});
		res.cookie(
			'token',
			await this.jwtService.tokenise({
				login: user.dataValues.login,
			}),
			{
				maxAge: 42 * 60 * 1000, // 42 minutes
				httpOnly: false,
				secure: false,
				sameSite: 'lax',
			},
		);
		return {
			login: user.dataValues.login,
			status: user.dataValues.hasTFA ? 'connecting' : 'logged',
			needToTFA: user.dataValues.hasTFA,
		};
	}

	/**
	 * @brief Logout
	 * @param {Record<string, any>} session Session (redis)
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 500 - Internal server error
	 */
	@Get('logout')
	@UseGuards(UserClearanceGuard)
	async intraLogout(
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		res.clearCookie('token');
	}

	@Get('clearance')
	async getClearance(
		@Req() req: Request,
	): Promise<{ clearance: number; login: string }> {
		if (!req.cookies.token)
			return {
				clearance: Number(process.env.GUEST_CLEARANCE),
				login: 'guest',
			};
		const login = (await this.jwtService.verify(req.cookies.token)).login;
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return {
			clearance: user.dataValues.clearance,
			login: user.dataValues.login,
		};
	}

	// /**
	//  * @brief verify the TOTP code
	//  * @param {number} TOTP TOTP code
	//  * @param {Record<string, any>} session Session (redis)
	//  * @returns { {
	//  * 				status: 'logged'
	//  * 		} } Status of the login
	//  * @security Clearance user
	//  * @response 200 - OK
	//  * @response 400 - Bad request
	//  * @response 404 - Not found
	//  * @response 500 - Internal server error
	//  */
	// @Post('TFA')
	// @UseGuards(UserClearanceGuard)
	// async verifyTFA(
	// 	@Body('TOTP') TOTP: number,
	// 	@Req() req: Request,
	// ): Promise<{ status: 'logged' }> {
	// 	let user = await this.userService.findByLogin(req.cookies.userLogin);
	// 	if (!user)
	// 		throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	// 	if (
	// 		!(await this.authService.verifyTOTP(
	// 			TOTP,
	// 			user.dataValues.TFASecret,
	// 		))
	// 	)
	// 		throw new HttpException('Invalid TOTP', HttpStatus.BAD_REQUEST);
	// 	return {
	// 		status: 'logged',
	// 	};
	// }
}
