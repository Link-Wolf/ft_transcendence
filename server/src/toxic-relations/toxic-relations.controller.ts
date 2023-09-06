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
import { Block } from 'src/block/block.entity';
import { BlockService } from 'src/block/block.service';
import { Friendship } from 'src/friendship/friendship.entity';
import { FriendshipService } from 'src/friendship/friendship.service';
import { AdminUserGuardPost } from 'src/guards/admin_user.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { MembershipService } from 'src/membership/membership.service';
import { MessageService } from 'src/message/message.service';
import { ToxicGuard } from 'src/guards/toxic.guard';
import { Channel } from 'src/channel/channel.entity';
import { ChannelService } from 'src/channel/channel.service';
import { BanService } from 'src/ban/ban.service';
import { ParseBoolPipe } from 'src/membership/membership.pipe';
import { Membership } from 'src/membership/membership.entity';

@Controller('toxic-relations')
export class ToxicRelationsController {
	constructor(
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
		private readonly membershipService: MembershipService,
		private readonly messageService: MessageService,
		private readonly banService: BanService,
		private readonly channelService: ChannelService,
	) {}

	/**
	 * @brief Get all public channels without those already joined by the user
	 * @returns {Channel[]} All public channels except those already joined by the user
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 500 - Internal Server Error
	 */
	@Get('public/me')
	@UseGuards(UserClearanceGuard)
	async getPublicWithoutMine(@Req() req: Request): Promise<Channel[]> {
		let sender = await this.userService.verify(req.cookies.token);
		if (!sender)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let ret = await this.channelService.findPublicWithoutMine(sender.login);
		let bans = await this.banService.findByLogin(sender.login);
		ret = ret.filter((channel) => {
			return !bans.some((ban) => ban.channelName === channel.name);
		});
		return ret;
	}

	@Get('user/:login/channel/:chann_name')
	@UseGuards(ToxicGuard)
	async getToxicity(
		@Param('login') login: string,
		@Param('chann_name') chann_name: string,
	): Promise<any> {
		if (!login || !chann_name)
			throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!(await this.membershipService.findByChannel(chann_name)))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let trueMembers = await this.membershipService.findByChannel(
			chann_name,
		);
		let messageAuthors = await this.messageService.findByChannel(
			chann_name,
		);
		let blocked = await this.blockService.findBlocksBy(login);
		let blockers = await this.blockService.findBlockersOf(login);
		let friends = await this.friendshipService.findFriends(login);

		const reducer = (isMember: boolean) => (acc: any, cur: any) => {
			return {
				...acc,
				[cur.dataValues.user.login]: {
					user: cur.dataValues.user,
					isMember: isMember,
					isBlocked: blocked.some(
						(block) => block.blockedLogin === cur.user.login,
					),
					isBlocker: blockers.some(
						(block) => block.blockerLogin === cur.user.login,
					),
					isFriend: friends.some(
						(friend) =>
							friend.dataValues.senderLogin === cur.user.login ||
							friend.dataValues.receiverLogin === cur.user.login,
					),
				},
			};
		};

		let ret = {
			...messageAuthors.reduce(reducer(false), {}),
			...trueMembers.reduce(reducer(true), {}),
		};

		return ret;
	}

	/**
	 * @brief Create a membership
	 * @param {string} channelName The channel name
	 * @param {string} userLogin The user login
	 * @param {boolean} isAdmin Whether the user is admin or not
	 * @return {Membership} The created membership
	 * @security Clearance admin or being the user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post('membership')
	@UseGuards(AdminUserGuardPost)
	async create(
		@Body('chanName') channelName: string,
		@Body('userLogin') userLogin: string,
		@Body('isAdmin', ParseBoolPipe) isAdmin: boolean = false,
	): Promise<Membership> {
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		if (
			await this.membershipService.findByUserAndChannel(
				userLogin,
				channelName,
			)
		)
			throw new HttpException(
				'Membership already exists',
				HttpStatus.CONFLICT,
			);
		if (
			(
				await this.banService.findByLoginAndChannel(
					userLogin,
					channelName,
				)
			).length
		)
			throw new HttpException(
				'User is banned from this channel',
				HttpStatus.FORBIDDEN,
			);
		return await this.membershipService.create({
			user: user,
			channel: channel,
			isAdmin: isAdmin,
		});
	}

	/**
	 * @brief Create a new block and if a friendship exists between the two users, delete it
	 * @param {string} blockerLogin The login of the blocker
	 * @param {string} blockedLogin The login of the blocked
	 * @return {Block} The block created
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post('block')
	@UseGuards(AdminUserGuardPost)
	async blockSoNoFriendForYou(
		@Body('userLogin') blockerLogin: string,
		@Body('blocked') blockedLogin: string,
	): Promise<Block> {
		if (!blockedLogin || !blockerLogin)
			throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
		let blocker = await this.userService.findByLogin(blockerLogin);
		if (!blocker)
			throw new HttpException('Blocker not found', HttpStatus.NOT_FOUND);
		let blocked = await this.userService.findByLogin(blockedLogin);
		if (!blocked)
			throw new HttpException('Blocked not found', HttpStatus.NOT_FOUND);
		if (blockerLogin === blockedLogin)
			throw new HttpException(
				'You cannot block yourself',
				HttpStatus.CONFLICT,
			);
		const block = await this.blockService.findBlockByBothLogin(
			blockerLogin,
			blockedLogin,
		);
		if (!block) {
			let friendship = await this.friendshipService.findByBothFriends(
				blockerLogin,
				blockedLogin,
			);
			if (friendship) {
				await this.friendshipService.delete(friendship);
			}

			return this.blockService.create({
				blocked: blocked,
				blocker: blocker,
				blockedLogin: blockedLogin,
				blockerLogin: blockerLogin,
			});
		}
	}
}
