import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MembershipService } from 'src/membership/membership.service';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check wheter the user has the clearance needed to access
 * the route, or is the user targeted by the route, or being in the channel targeted by the route.
 */
@Injectable()
export class AdminChannelusersGuard implements CanActivate {
	constructor(private clearanceNeeded: number) {}
	private readonly userService: UserService;
	private readonly membershipService: MembershipService;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let jwt_data: any;
		const userLogin = context.switchToHttp().getRequest().params.login;
		const cookies = context.switchToHttp().getRequest().cookies;
		const channelName = context.switchToHttp().getRequest()
			.params.chan_name;
		let clearance = 0;
		if (cookies.token) {
			jwt_data = jwt.verify(cookies['token'], process.env.JWT_SECRET);
			const user = await this.userService.findByLogin(jwt_data.login);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const membership = await this.membershipService.findByUserAndChannel(
			userLogin,
			channelName,
		);
		if (membership) return true;
		else if (clearance >= this.clearanceNeeded) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//TODO: tester lol
	}
}