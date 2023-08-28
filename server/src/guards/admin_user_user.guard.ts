import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check wheter the user has the clearance needed to access
 * the route, or is the userA targeted by the route, or is the userB targeted by the route.
 */
@Injectable()
export class AdminUserUserGuard implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(AuthService)
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let user: any;
		const userLoginA = context.switchToHttp().getRequest().params.loginA;
		const userLoginB = context.switchToHttp().getRequest().params.loginB;
		const cookies = context.switchToHttp().getRequest().cookies;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		if (userLoginA === user.dataValues.login) return true;
		else if (userLoginB === user.dataValues.login) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//TODO: tester lol
	}
}

@Injectable()
export class AdminUserUserGuardPost implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(AuthService)
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let user: any;
		const userLoginA = context.switchToHttp().getRequest().body.loginA;
		const userLoginB = context.switchToHttp().getRequest().body.loginB;
		const cookies = context.switchToHttp().getRequest().cookies;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		if (userLoginA === user.dataValues.login) return true;
		else if (userLoginB === user.dataValues.login) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//TODO: tester lol
	}
}
