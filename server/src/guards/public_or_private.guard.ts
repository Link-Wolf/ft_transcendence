import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { AuthService } from 'src/auth/auth.service';

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
		@Inject(AuthService)
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel_name = context.switchToHttp().getRequest().params.name;
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: any;
		let clearance = 0;
		if (cookies.token) {
			user = await this.authService.verify(cookies.auth);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		//TODO: tester
		const channel = await this.channelService.findByName(channel_name);
		if (
			channel.isPrivate &&
			clearance >= Number(process.env.ADMIN_CLEARANCE)
		)
			return true;
		else if (
			!channel.isPrivate &&
			clearance >= Number(process.env.USER_CLEARANCE)
		)
			return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
