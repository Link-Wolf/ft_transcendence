import {
	Body,
	Controller,
	HttpException,
	HttpStatus,
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

@Controller('toxic-relations')
export class ToxicRelationsController {
	constructor(
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	) {}

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
