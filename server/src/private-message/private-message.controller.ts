import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { Channel } from 'src/channel/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { MembershipService } from 'src/membership/membership.service';
import { UserService } from 'src/user/user.service';

@Controller('private-message')
export class PrivateMessageController {
	constructor(
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
		private readonly membershipService: MembershipService,
	) {}

	/**
	 * @brief Create a private message channel
	 * @param {string} loginOther The other user's login
	 * @returns {Channel} The created channel
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 404 - User not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminClearanceGuard)
	async create(@Body('loginOther') loginOther: string): Promise<Channel> {
		//TODO: check if already exist
		let me = await this.userService.findByLogin('me' /* TODO: session */);
		let otherMember = await this.userService.findByLogin(loginOther);
		if (!otherMember)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.create({
			isPrivate: true,
			name: `_${[me, otherMember].sort()[0]}&${
				[me, otherMember].sort()[1]
			}`, //NOTE: _loginA&loginB
		});
		await this.membershipService.create({ user: me, channel: channel });
		await this.membershipService.create({
			user: otherMember,
			channel: channel,
		});
		return channel;
	}
}
