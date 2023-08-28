import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
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
import { User } from 'src/user/user.entity';
import { AdminUserGuard } from 'src/guards/admin_user.guard';
import { FriendshipService } from 'src/friendship/friendship.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('private-message')
export class PrivateMessageController {
	constructor(
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
		private readonly membershipService: MembershipService,
		private readonly friendshipService: FriendshipService,
		private readonly authService: AuthService,
	) {}

	/**
	 * @brief find all users that can be potential new DMs or that have a DM with the user
	 * @param {string} login The user's login
	 * @returns {User[]} The users that can be potential new DMs or that have a DM with the user
	 * @security Clearance admin oruser himself
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - User not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':login')
	@UseGuards(AdminUserGuard)
	async findMyPotentialNewDMs(
		@Param('login') login: string,
	): Promise<User[]> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		}
		let friendships = await this.friendshipService.findFriends(login);
		let ret = friendships.map((friendship) => {
			if (friendship.receiver.login === login) {
				return friendship.sender;
			} else {
				return friendship.receiver;
			}
		});
		return ret;
	}

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
		let me = await this.userService.verify(req.cookies.token);
		let otherMember = await this.userService.findByLogin(loginOther);
		if (!otherMember || !me)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(
			`_${
				[me.dataValues.login, otherMember.dataValues.login].sort()[0]
			}&${[me.dataValues.login, otherMember.dataValues.login].sort()[1]}`,
		);
		if (channel) return channel;
		channel = await this.channelService.create({
			isPrivate: true,
			name: `_${
				[me.dataValues.login, otherMember.dataValues.login].sort()[0]
			}&${[me.dataValues.login, otherMember.dataValues.login].sort()[1]}`, //NOTE: _loginA&loginB
		});
		await this.membershipService.create({ user: me, channel: channel });
		await this.membershipService.create({
			user: otherMember,
			channel: channel,
		});
		return channel;
	}
}
