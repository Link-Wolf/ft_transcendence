import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { MembershipService } from 'src/membership/membership.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check wheter the user has the clearance needed to access
 * the route, or is the user targeted by the route, or being in the channel targeted by the route.
 */
@Injectable()
export class AdminUserChannelusersGuard implements CanActivate {
	constructor(
		@Inject(MembershipService)
		private readonly membershipService: MembershipService,
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const userLogin = context.switchToHttp().getRequest().params.login;
		const cookies = context.switchToHttp().getRequest().cookies;
		const channelName = context.switchToHttp().getRequest()
			.params.chan_name;
		let clearance = 0;
		let user: User;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const membership = await this.membershipService.findByUserAndChannel(
			userLogin,
			channelName,
		);
		if (userLogin === user.dataValues.login) return true;
		else if (membership) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//TODO: tester lol
	}
}
