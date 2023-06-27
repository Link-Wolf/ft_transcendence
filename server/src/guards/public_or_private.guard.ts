import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { ChannelService } from 'src/channel/channel.service';

/**
 * This guard is used to check whether the user has the clearance needed to access
 * a private channel (admin) AND the channel is private, or the user has the
 * clearance needed to access a public channel (user) AND the channel is public.
 */
@Injectable()
export class PublicOrPrivateGuard implements CanActivate {
	constructor(private clearanceNeeded: number) {}
	private readonly userService: UserService;
	private readonly channelService: ChannelService;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const channel_name = context.switchToHttp().getRequest().params.name;
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
		//TODO: tester
		const channel = await this.channelService.findByName(channel_name);
		if (channel.isPrivate && clearance >= this.clearanceNeeded) return true;
		else if (
			!channel.isPrivate &&
			clearance >= Number(process.env.USER_CLEARANCE)
		)
			return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
	}
}
