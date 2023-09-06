import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check wheter the user has the clearance needed to access
 * the route, or is the user targeted by the route.
 */
@Injectable()
export class AdminUserGuard implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let user: User;
		const userLogin = context.switchToHttp().getRequest().params.login;
		const cookies = context.switchToHttp().getRequest().cookies;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		if (userLogin === user.dataValues.login) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}

@Injectable()
export class AdminUserGuardPost implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let user: User;
		const userLogin = context.switchToHttp().getRequest().body.userLogin;
		const cookies = context.switchToHttp().getRequest().cookies;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		if (userLogin === user.dataValues.login) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
