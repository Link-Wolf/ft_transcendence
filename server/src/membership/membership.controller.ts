import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	UseGuards,
	Patch,
	Delete,
	NotFoundException,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { AdminClearanceGuard } from '../guards/admin_clearance.guard';
import { ParseBoolPipe } from './membership.pipe';
import { MembershipService } from './membership.service';
import { UserService } from '../user/user.service';
import { Membership } from './membership.entity';
import { ChannelService } from '../channel/channel.service';
import { AdminUserGuard } from 'src/guards/admin_user.guard';
import { AdminOwnerGuard } from 'src/guards/admin_owner.guard';
import { AdminOwnerAdminUserGuard } from 'src/guards/admin_owner_admin_user.guard';
import { AdminUserChannelusersGuard } from 'src/guards/admin_user_channelusers.guard';
import { AdminChannelusersGuard } from 'src/guards/admin_channelusers.guard';

@Controller('membership')
export class MembershipController {
	constructor(
		private readonly membershipService: MembershipService,
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
	) {}

	/**
	 * @brief Get all memberships
	 * @return {Membership[]} All memberships
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async getAll(): Promise<Membership[]> {
		return this.membershipService.findAll();
	}

	/**
	 * @brief Get all memberships of a user
	 * @param {string} login The user login
	 * @return {Membership[]} All memberships of a user
	 * @security Clearance admin OR the user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login')
	@UseGuards(AdminUserGuard) //TODO: Better guarding
	async getByUser(@Param('login') login: string): Promise<Membership[]> {
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByUser(login);
	}

	/**
	 * @brief Get all memberships of a channel
	 * @param {string} chan_name The channel name
	 * @return {Membership[]} All memberships of a channel
	 * @security Clearance admin OR being in the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('channel/:chan_name')
	@UseGuards(AdminChannelusersGuard) //TODO: Better guarding
	async getByChannel(
		@Param('chan_name') chan_name: string,
	): Promise<Membership[]> {
		if (!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByChannel(chan_name);
	}

	/**
	 * @brief Get a membership by user and channel
	 * @param {string} login The user login
	 * @param {string} chan_name The channel name
	 * @return {Membership} The membership
	 * @security Clearance admin OR the user OR being in the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login/channel/:chan_name')
	@UseGuards(
		AdminUserChannelusersGuard,
	) //TODO: Better guarding
	async getByUserAndChannel(
		@Param('login') login: string,
		@Param('chan_name') chan_name: string,
	): Promise<Membership> {
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByUserAndChannel(login, chan_name);
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
	@Post()
	@UseGuards(AdminUserGuard) //TODO: Better guarding
	async create(
		@Body('channelName') channelName: string,
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
		return await this.membershipService.create({
			user: user,
			channel: channel,
			isAdmin: isAdmin,
		});
	}

	/**
	 * @brief Update a membership (only to change weather the user is admin or not)
	 * @param {string} userLogin The user login
	 * @param {string} channelName The channel name
	 * @param {boolean} isAdmin Whether the user is admin or not
	 * @return {number} The number of updated memberships
	 * @security Clearance admin OR channel owner
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Patch('user/:login/channel/:chann_name')
	@UseGuards(AdminOwnerGuard) //TODO: Better guarding
	async update(
		@Param('login') userLogin: string,
		@Param('chann_name') channelName: string,
		@Body('isAdmin', ParseBoolPipe) isAdmin?: boolean,
	): Promise<number> {
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		if (
			!this.membershipService.findByUserAndChannel(userLogin, channelName)
		)
			throw new HttpException(
				'Membership not found',
				HttpStatus.NOT_FOUND,
			);
		return this.membershipService.update({
			user: user,
			channel: channel,
			isAdmin: isAdmin,
		});
	}

	/**
	 * @brief Delete a membership
	 * @param {string} login The user login
	 * @param {string} chan_name The channel name
	 * @return {number} The number of deleted memberships
	 * @security Clearance admin OR the user OR channel admin OR channel owner
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Delete('user/:login/channel/:chan_name')
	@UseGuards(
		AdminOwnerAdminUserGuard,
	) //TODO: Better guarding
	async delete(
		@Param('login') login: string,
		@Param('chan_name') chan_name: string,
	) {
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if (!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		if (!this.membershipService.findByUserAndChannel(login, chan_name))
			throw new HttpException(
				'Membership not found',
				HttpStatus.NOT_FOUND,
			);
		return this.membershipService.delete(login, chan_name);
	}
}
