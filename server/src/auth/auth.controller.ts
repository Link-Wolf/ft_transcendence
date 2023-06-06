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

	@Get('login')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async login(
		@Query('code') code: string,
		@Session() session: Record<string, any>
	)
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
			let i = 2;
			while (await this.userService.findByName(name + i))
				i++;
			user = await this.userService.create({
				login: intraUser.login,
				name: name + i,
				clearance: Number(process.env.USER_CLEARANCE),
				/* avatar: default_avatar */
			});
		}
		session.userLogin = user.dataValues.login;
		session.needToA2F = user.dataValues.has2FA;
		if (!user.dataValues.hasConnected)
			await this.userService.update({login: user.dataValues.login, hasConnected: true});
		return {
			status: status,
			needTo2FA: user.dataValues.has2FA
		};
	}

	@Get('logout')
	@UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
	async logout(
		@Session() session: Record<string, any>
	)
	{
		session.destroy();
	}

	@Post('A2F')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async A2F(
		@Body('TOTP') TOTP: string,
		@Session() session: Record<string, any>
	)
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