import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { Friendship } from './friendship.entity';
import { UserService } from 'src/user/user.service';
import { BlockService } from 'src/block/block.service';
import { AdminUserGuard } from 'src/guards/admin_user.guard';
import { AdminUserUserGuard } from 'src/guards/admin_user_user.guard';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AdminInvitedUserGuard } from 'src/guards/admin_invited_user.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('friendship')
export class FriendshipController {
	constructor(
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
		private readonly blockService: BlockService,
		private readonly authService: AuthService,
	) {}

	/**
	 * @brief Get all friendships
	 * @returns {Friendship[]} All friendships
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async getAll(): Promise<Friendship[]> {
		return await this.friendshipService.findAll();
	}

	/**
	 * @brief Get all friends of a user
	 * @param {string} login - The user's login
	 * @returns {Friendship[]} All friends of the user
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get(':login')
	@UseGuards(AdminUserGuard)
	async getFriends(@Param('login') login: string): Promise<Friendship[]> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return await this.friendshipService.findFriends(login);
	}

	/**
	 * @brief Get all invitations an user received
	 * @param {string} login - The user's login
	 * @returns {Friendship[]} All invitations the user received
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('invitations/:login')
	@UseGuards(AdminUserGuard)
	async getInvitations(@Param('login') login: string): Promise<Friendship[]> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return await this.friendshipService.findInvitations(login);
	}

	/**
	 * @brief Get all pending requests of one sender
	 * @param {string} login - The user's login
	 * @returns {Friendship[]} All pending requests the user sent
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('requests/:login')
	@UseGuards(AdminUserGuard)
	async getRequests(@Param('login') login: string): Promise<Friendship[]> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return await this.friendshipService.findRequests(login);
	}

	/**
	 * @brief Get one friendship by both friends
	 * @param {string} loginA - The first user's login
	 * @param {string} loginB - The second user's login
	 * @returns {Friendship} The friendship
	 * @security Clearance admin OR userA OR userB
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get(':loginA/:loginB') //get one by both friends
	@UseGuards(AdminUserUserGuard)
	async getOne(
		@Param('loginA') loginA: string,
		@Param('loginB') loginB: string,
	): Promise<Friendship> {
		let userA = await this.userService.findByLogin(loginA);
		let userB = await this.userService.findByLogin(loginB);
		if (!userA || !userB)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let ret = await this.friendshipService.findByBothFriends(
			loginA,
			loginB,
		);
		return ret;
	}

	/**
	 * @brief Create a friendship
	 * @param {string} receiverLogin - The receiver's login
	 * @returns {Friendship} The created friendship
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(UserClearanceGuard)
	async create(
		@Req() req: Request,
		@Body('receiverLogin') receiverLogin: string,
	): Promise<Friendship> {
		let sender = await this.authService.verify(req.cookies.auth);
		let receiver = await this.userService.findByLogin(receiverLogin);
		if (!receiver || !sender)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let senderBlockList = await this.blockService.findBlocksBy(
			sender.dataValues.login,
		);
		let receiverBlockList = await this.blockService.findBlocksBy(
			receiverLogin,
		);
		if (
			senderBlockList.some(
				(block) => block.dataValues.blocked == receiver,
			) ||
			receiverBlockList.some(
				(block) => block.dataValues.blocked == sender,
			)
		)
			throw new HttpException('Friendship blocked', HttpStatus.FORBIDDEN);
		let friendship = await this.friendshipService.findByBothFriends(
			sender.dataValues.login,
			receiverLogin,
		);
		if (friendship) {
			if (!friendship.dataValues.isPending)
				throw new HttpException(
					'Friendship already exists',
					HttpStatus.CONFLICT,
				);
			if (friendship.dataValues.sender == sender)
				throw new HttpException(
					'Invitation already sent',
					HttpStatus.CONFLICT,
				);
			if (friendship.dataValues.sender == receiver) {
				await this.friendshipService.update({
					isPending: false,
					receiver: receiver,
					sender: sender,
				});
				friendship.reload();
				return friendship;
			}
		}
		return await this.friendshipService.create({
			sender: sender,
			receiver: receiver,
			isPending: true,
		});
	}

	/**
	 * @brief Accept a friendship invitation
	 * @param {string} loginA - The first user's login
	 * @param {string} loginB - The second user's login
	 * @returns {number} The number of updated rows
	 * @security Clearance admin OR invited user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Patch(':loginA/:loginB')
	@UseGuards(AdminInvitedUserGuard)
	async update(
		@Req() req: Request,
		@Param('loginA') loginA: string,
		@Param('loginB') loginB: string,
	): Promise<number> {
		let userA = await this.userService.findByLogin(loginA);
		let userB = await this.userService.findByLogin(loginB);
		if (!userA || !userB)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let friendship = await this.friendshipService.findByBothFriends(
			loginA,
			loginB,
		);
		if (!friendship)
			throw new HttpException(
				'Friendship not found',
				HttpStatus.NOT_FOUND,
			);
		if (
			friendship.dataValues.receiver !==
			(await this.authService.verify(req.cookies.auth))
		)
			throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		if (!friendship.dataValues.isPending)
			throw new HttpException(
				'Friendship already accepted',
				HttpStatus.CONFLICT,
			);
		return await this.friendshipService.update({
			isPending: false,
			receiver: friendship.dataValues.receiver,
			sender: friendship.dataValues.sender,
		});
	}

	/**
	 * @brief Delete a friendship
	 * @param {string} loginA - The first user's login
	 * @param {string} loginB - The second user's login
	 * @security Clearance admin OR userA OR userB
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':loginA/:loginB')
	@UseGuards(AdminUserUserGuard)
	async delete(
		@Param('loginA') loginA: string,
		@Param('loginB') loginB: string,
	): Promise<void> {
		let userA = await this.userService.findByLogin(loginA);
		let userB = await this.userService.findByLogin(loginB);
		if (!userA || !userB)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let friendship = await this.friendshipService.findByBothFriends(
			loginA,
			loginB,
		);
		if (!friendship)
			throw new HttpException(
				'Friendship not found',
				HttpStatus.NOT_FOUND,
			);
		await this.friendshipService.delete(friendship);
	}
}
