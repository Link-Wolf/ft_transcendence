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
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { MembershipService } from 'src/membership/membership.service';
import { MessageService } from 'src/message/message.service';
import { ToxicGuard } from 'src/guards/toxic.guard';
import { isMACAddress } from 'class-validator';

@Controller('toxic-relations')
export class ToxicRelationsController {
	constructor(
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
		private readonly membershipService: MembershipService,
		private readonly messageService: MessageService,
	) {}

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
		let messageAuthors = await this.messageService.findByUser(login);
		let blocked = await this.blockService.findBlocksBy(login);
		let blockers = await this.blockService.findBlockersOf(login);
		let friends = await this.friendshipService.findFriends(login);

		const reducer = (isMember: boolean) => (acc: any, cur: any) => {
			return {
				...acc,
				[cur.user.login]: {
					user: cur.user,
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
