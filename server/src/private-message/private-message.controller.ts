import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { Channel } from 'src/channel/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { MembershipService } from 'src/membership/membership.service';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

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
	@UseGuards(UserClearanceGuard)
	async create(
		@Req() req: Request,
		@Body('loginOther') loginOther: string,
	): Promise<Channel> {
		let senderLogin = jwt.verify(
			req.cookies.token,
			process.env.JWT_KEY,
		).login;
		let me = await this.userService.findByLogin(senderLogin);
		let otherMember = await this.userService.findByLogin(loginOther);
		if (!otherMember || !me)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(
			`_${[me, otherMember].sort()[0]}&${[me, otherMember].sort()[1]}`,
		);
		if (channel) return channel;
		channel = await this.channelService.create({
			isPrivate: true,
			name: `_${[me, otherMember].sort()[0]}&${
				[me, otherMember].sort()[1]
			}`, //NOTE:  loginA&loginB
		});
		await this.membershipService.create({ user: me, channel: channel });
		await this.membershipService.create({
			user: otherMember,
			channel: channel,
		});
		return channel;
	}
}
