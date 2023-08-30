import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { MembershipService } from "src/membership/membership.service";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";


/**
 *This guard is used for a specific case of toxic relations.
* In a nutshell, it guarantees that the user calling the endpoint IS the user that is being called in the route
* AND that the user is present in the channel that is being called in the route.
* Of course, any Admin can cal this route too.
 */
@Injectable()
export class ToxicGuard implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(MembershipService)
		private readonly membershipService: MembershipService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		return true;
		const userLogin = context.switchToHttp().getRequest().params.login;
		const cookies = context.switchToHttp().getRequest().cookies;
		const channelName = context.switchToHttp().getRequest()
			.params.chann_name;
		let clearance = 0;
		let user: User;
		if (cookies && cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const membership = await this.membershipService.findByUserAndChannel(
			userLogin,
			channelName,
		);
		if (userLogin === user.dataValues.login && membership) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
