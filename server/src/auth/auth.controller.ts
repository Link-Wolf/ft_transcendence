import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
// const { Image, createCanvas } = require('canvas');
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { JWTService } from './jwt.service';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import * as otplib from 'otplib';
import { AdminUserGuard } from 'src/guards/admin_user.guard';

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
		firstConnection: boolean;
		needTFA: boolean;
		login: string;
	}> {
		let intraUser = await this.authService.getIntraUser(code);
		let firstConnection = false;
		if (!intraUser)
			throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
		let user = await this.userService.findByLogin(intraUser.login);

		// CREATE A NEW USER
		if (!user) {
			firstConnection = true;
			user = await this.userService.create({
				login: intraUser.login,
				clearance: Number(process.env.USER_CLEARANCE),
				name: await this.authService.generateName(),
				TFASecret: otplib.authenticator.generateSecret(),
			});
			await this.authService.generateProfilePicture(
				user.dataValues.login,
			);
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
				needTFA: user.dataValues.hasTFA,
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
			firstConnection: firstConnection,
			needTFA: user.dataValues.hasTFA,
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
		let user = await this.userService.verify(req.cookies.token);
		if (!user)
			return {
				clearance: Number(process.env.GUEST_CLEARANCE),
				login: 'guest',
			};
		return {
			clearance: user.dataValues.clearance,
			login: user.dataValues.login,
		};
	}

	@Get('generateSecret/:login')
	@UseGuards(AdminUserGuard)
	async generateSecret(@Param('login') login: string): Promise<string> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return user.TFASecret;
	}

	@Post('enableTFA/:login')
	async enableTFA(
		@Body('code') token: string,
		@Param('login') login: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<boolean> {
		if (!token || !login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		const user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		if (!user.TFASecret) {
			throw new HttpException(
				'User has no TFA secret',
				HttpStatus.BAD_REQUEST,
			);
		}

		let ret = await this.userService.verifyTFA(login, token);
		if (ret) {
			res.cookie(
				'token',
				await this.jwtService.tokenise({
					login: user.dataValues.login,
					needTFA: false,
				}),
			);
			this.userService.update({
				login: login,
				hasTFA: true,
			});
		}
		return ret;
	}

	@Post('verifyTFA/:login')
	async verifyTFA(
		@Body('code') token: string,
		@Param('login') login: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<boolean> {
		if (!token || !login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		const user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		if (!user.TFASecret) {
			throw new HttpException(
				'User has no TFA secret',
				HttpStatus.BAD_REQUEST,
			);
		}
		let ret = await this.userService.verifyTFA(login, token);
		if (ret) {
			res.cookie(
				'token',
				await this.jwtService.tokenise({
					login: user.dataValues.login,
					needTFA: false,
				}),
			);
		}
		return ret;
	}

	@Post('disableTFA/:login')
	@UseGuards(AdminUserGuard)
	async disableTFA(
		@Param('login') login: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		const user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		if (!user.hasTFA) {
			throw new HttpException(
				'User has no active TFA',
				HttpStatus.BAD_REQUEST,
			);
		}
		res.cookie(
			'token',
			await this.jwtService.tokenise({
				login: user.dataValues.login,
				needTFA: false,
			}),
		);
		this.userService.update({
			login: login,
			hasTFA: false,
		});
		return;
	}
}
