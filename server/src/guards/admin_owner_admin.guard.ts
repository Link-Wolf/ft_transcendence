import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { MembershipService } from '../membership/membership.service';
import { ChannelService } from 'src/channel/channel.service';

/**
 * This guard is used to check whether the user has the clearance needed to access
 * the route, or is an admin of the channel, or is the owner of the channel.
 */
@Injectable()
export class AdminOwnerAdminGuard implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(MembershipService)
		private readonly membershipService: MembershipService,
		@Inject(ChannelService)
		private readonly channelService: ChannelService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel = context.switchToHttp().getRequest().params.chann_name;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let jwt_data: any;
		let clearance = 0;
		if (cookies.token) {
			jwt_data = jwt.verify(cookies['token'], process.env.JWT_KEY);
			user = await this.userService.findByLogin(jwt_data.login);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		let isAdminOfChannel = (
			await this.membershipService.findAdminsByChannel(channel)
		).includes(user);
		let isOwnerOfChannel = await this.channelService.isOwner(
			jwt_data.login,
			channel,
		);
		//TODO: tester
		if (isAdminOfChannel) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else if (isOwnerOfChannel) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}

@Injectable()
export class AdminOwnerAdminGuardPost implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
		@Inject(MembershipService)
		private readonly membershipService: MembershipService,
		@Inject(ChannelService)
		private readonly channelService: ChannelService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel = context.switchToHttp().getRequest().body.chann_name;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let jwt_data: any;
		let clearance = 0;
		if (cookies.token) {
			jwt_data = jwt.verify(cookies['token'], process.env.JWT_KEY);
			user = await this.userService.findByLogin(jwt_data.login);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		let isAdminOfChannel = (
			await this.membershipService.findAdminsByChannel(channel)
		).includes(user);
		let isOwnerOfChannel = await this.channelService.isOwner(
			jwt_data.login,
			channel,
		);
		//TODO: tester
		if (isAdminOfChannel) return true;
		else if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else if (isOwnerOfChannel) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
