import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ChannelService } from 'src/channel/channel.service';

/**
 * This guard is used to check whether the user has the clearance needed to access
 * the route, or is the owner of the channel.
 */
@Injectable()
export class AdminOwnerGuard implements CanActivate {
	constructor(
		@Inject(ChannelService)
		private readonly channelService: ChannelService,
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel = context.switchToHttp().getRequest().params.chann_name;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		let isOwnerOfChannel = await this.channelService.isOwner(
			user.dataValues.login,
			channel,
		);
		if (clearance >= Number(process.env.ADMIN_CLEARANCE)) return true;
		else if (isOwnerOfChannel) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
