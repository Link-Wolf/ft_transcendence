import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MembershipService } from '../membership/membership.service';
import { ChannelService } from 'src/channel/channel.service';

/**
 * This guard is used to check whether the user has the clearance needed to access
 * the route, or is an admin of the channel, or is the owner of the channel, or is
 * the user targeted by the route.
 */
@Injectable()
export class AdminOwnerAdminUserGuard implements CanActivate {
	constructor(
		@Inject(MembershipService)
		private readonly membershipService: MembershipService,
		@Inject(ChannelService)
		private readonly channelService: ChannelService,
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel = context.switchToHttp().getRequest().params.chann_name;
		const userLogin = context.switchToHttp().getRequest().params.login;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let clearance = 0;

		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);

		const admins = await this.membershipService.findAdminsByChannel(
			channel,
		);
		let isAdminOfChannel = admins.some(
			(admin) => admin.dataValues.userLogin === user.dataValues.login,
		);

		let isOwnerOfChannel = await this.channelService.isOwner(
			user.dataValues.login,
			channel,
		);
		//TODO: tester
		if (isAdminOfChannel) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else if (isOwnerOfChannel) return true;
		else if (userLogin === user.dataValues.login) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
