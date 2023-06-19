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
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { JWTService } from './jwt.service';

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
	 * 				needTo2FA: boolean
	 * 		} } Status of the login and if the user enabled 2FA
	 * @security Anyone
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 500 - Internal server error
	 */
	@Get('login')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async intraLogin(
		@Query('code') code: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<{
		status: string;
		needTo2FA: boolean;
	}> {
		let status = 'logged';
		let intraUser = await this.authService.getIntraUser(code);
		if (!intraUser)
			throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
		let user = await this.userService.findByLogin(intraUser.login);
		if (!user) {
			status = 'registered';
			let name = intraUser.usual_first_name
				? intraUser.usual_first_name
				: intraUser.first_name;
			let i = 1;
			while (await this.userService.findByName(name + (i == 1 ? '' : i)))
				i++;
			user = await this.userService.create({
				login: intraUser.login,
				name: name + (i == 1 ? '' : i),
				clearance: Number(process.env.USER_CLEARANCE),
				/* avatar: default_avatar */
			});
		}
		if (!user.dataValues.hasConnected)
			await this.userService.update({
				login: user.dataValues.login,
				hasConnected: true,
			});
		res.cookie('token', await this.jwtService.tokenise({
			login: user.dataValues.login
		}), {
			maxAge: 42 * 60 * 1000, // 42 minutes
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
		});
		return {
			status: status,
			needTo2FA: user.dataValues.has2FA,
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
	@UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
	async intraLogout(
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		res.clearCookie('token');
	}

	@Get('clearance')
	async getClearance(@Req() req: Request): Promise<number> {
		if (!req.cookies.token)
			return 0;
		const login = (await this.jwtService.verify(req.cookies.token)).login;
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return user.dataValues.clearance;
	}

	/**
	 * @brief verify the TOTP code
	 * @param {number} TOTP TOTP code
	 * @param {Record<string, any>} session Session (redis)
	 * @returns { {
	 * 				status: 'logged'
	 * 		} } Status of the login
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 404 - Not found
	 * @response 500 - Internal server error
	 */
	@Post('A2F')
	@UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
	async verifyA2F(
		@Body('TOTP') TOTP: number,
		@Req() req: Request,
	): Promise<{ status: 'logged' }> {
		let user = await this.userService.findByLogin(req.cookies.userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (
			!(await this.authService.verifyTOTP(
				TOTP,
				user.dataValues.A2FSecret,
			))
		)
			throw new HttpException('Invalid TOTP', HttpStatus.BAD_REQUEST);
		return {
			status: 'logged',
		};
	}
}
