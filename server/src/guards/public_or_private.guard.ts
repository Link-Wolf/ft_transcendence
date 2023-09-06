import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check whether the user has the clearance needed to access
 * a private channel (admin) AND the channel is private, or the user has the
 * clearance needed to access a public channel (user) AND the channel is public.
 */
@Injectable()
export class PublicOrPrivateGuard implements CanActivate {
	constructor(
		@Inject(ChannelService)
		private readonly channelService: ChannelService,
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel_name = context.switchToHttp().getRequest().params.name;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let clearance = 0;
		if (cookies.token) {
			user = await this.userService.verify(cookies.token);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const channel = await this.channelService.findByName(channel_name);
		if (!channel) return true;
		if (
			channel.dataValues.isPrivate &&
			clearance >= Number(process.env.ADMIN_CLEARANCE)
		)
			return true;
		else if (
			!channel.dataValues.isPrivate &&
			clearance >= Number(process.env.USER_CLEARANCE)
		)
			return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
