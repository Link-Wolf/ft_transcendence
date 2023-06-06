import { Body, Controller, Get, HttpException, HttpStatus, Post, Query, Session, UseGuards } from "@nestjs/common";
import { ClearanceGuard } from "src/guards/clearance.guard";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userService: UserService
	) { }
	
	/**
	 * @brief Login with intra
	 * @param {string} code Code given by intra
	 * @param {Record<string, any>} session Session (redis)
	 * @returns { {
	 * 				status: 'logged' | 'registered',
	 * 				needTo2FA: boolean
	 * 		} } Status of the login and if the user enabled 2FA
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 500 - Internal server error
	 */
	@Get('login')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async intraLogin(
		@Query('code') code: string,
		@Session() session: Record<string, any>
	): Promise<{
		status: string,
		needTo2FA: boolean
	}>
	{
		let status = 'logged'
		let intraUser = await this.authService.getIntraUser(code);
		if (!intraUser)
			throw new HttpException('Invalid code', HttpStatus.BAD_REQUEST);
		let user = await this.userService.findByLogin(intraUser.login);
		if (!user)
		{
			status = 'registered';
			let name = intraUser.first_name;
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
		session.userLogin = user.dataValues.login;
		session.needToA2F = user.dataValues.has2FA;
		if (!user.dataValues.hasConnected)
			await this.userService.update({login: user.dataValues.login, hasConnected: true});
		console.log(session)
		return {
			status: status,
			needTo2FA: user.dataValues.has2FA
		};
	}

	/**
	 * @brief Logout
	 * @param {Record<string, any>} session Session (redis)
	 * @response 200 - OK
	 * @response 500 - Internal server error
	 */
	@Get('logout')
	@UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
	async intraLogout(
		@Session() session: Record<string, any>
	): Promise<void>
	{
		try {
			return session.destroy();
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief verify the TOTP code
	 * @param {number} TOTP TOTP code
	 * @param {Record<string, any>} session Session (redis)
	 * @returns { {
	 * 				status: 'logged'
	 * 		} } Status of the login
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 404 - Not found
	 * @response 500 - Internal server error
	 */
	@Post('A2F')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async verifyA2F(
		@Body('TOTP') TOTP: number,
		@Session() session: Record<string, any>
	): Promise<{ status: 'logged' }>
	{
		let user = await this.userService.findByLogin(session.userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!await this.authService.verifyTOTP(TOTP, user.dataValues.A2FSecret))
			throw new HttpException('Invalid TOTP', HttpStatus.BAD_REQUEST);
		session.needToA2F = false;
		return {
			status: 'logged'
		};
	}
}