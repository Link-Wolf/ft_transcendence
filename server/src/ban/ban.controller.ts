import {
	Controller,
	Delete,
	Get,
	Post,
	Body,
	HttpException,
	HttpStatus,
	Param,
	UseGuards,
} from '@nestjs/common';
import { BanService } from './ban.service';
import { Ban } from './ban.entity';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/channel/channel.service';
import { MembershipService } from 'src/membership/membership.service';
import { AdminOwnerAdminGuard } from 'src/guards/admin_owner_admin.guard';

@Controller('ban')
export class BanController {
	constructor(
		private readonly banService: BanService,
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
		private readonly membershipService: MembershipService,
	) {}

	/**
	 * @brief Get all bans
	 * @return {Ban[]} All bans
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async getAllBans(): Promise<Ban[]> {
		return this.banService.findAll();
	}

	/**
	 * @brief Get a ban by its id
	 * @param {number} id The ban id
	 * @return {Ban} The ban
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':id')
	@UseGuards(AdminClearanceGuard)
	async getBanById(@Param('id') id: number): Promise<Ban> {
		let ret = await this.banService.findById(id);
		if (!ret)
			throw new HttpException('Ban not found', HttpStatus.NOT_FOUND);
		return ret;
	}

	/**
	 * @brief Get all bans of a user
	 * @param {string} login The user login
	 * @return {Ban[]} All bans of the user
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login')
	@UseGuards(AdminClearanceGuard)
	async getBansByUserLogin(@Param('login') login: string): Promise<Ban[]> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.banService.findByLogin(login);
	}

	/**
	 * @brief Get all bans of a channel
	 * @param {string} chann_name The channel name
	 * @return {Ban[]} All bans of the channel
	 * @security Clearance level: admin OR channel owner OR channel admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('channel/:chann_name')
	@UseGuards(new AdminOwnerAdminGuard(Number(process.env.ADMIN_CLEARANCE)))
	async getBansByChannelName(
		@Param('chann_name') chann_name: string,
	): Promise<Ban[]> {
		let chan = await this.channelService.findByName(chann_name);
		if (!chan)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.banService.findByChannel(chann_name);
	}

	/**
	 * @brief Get a ban by its user login and channel name
	 * @param {string} login The user login
	 * @param {string} chann_name The channel name
	 * @return {Ban} The ban
	 * @security Clearance level: admin OR channel owner OR channel admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login/channel/:chann_name')
	@UseGuards(new AdminOwnerAdminGuard(Number(process.env.ADMIN_CLEARANCE)))
	async getBanByUserLoginAndChannelName(
		@Param('login') login: string,
		@Param('chann_name') chann_name: string,
	): Promise<Ban> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let chan = await this.channelService.findByName(chann_name);
		if (!chan)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let ret = await this.banService.findByLoginAndChannel(
			login,
			chann_name,
		);
		if (!ret)
			throw new HttpException('Ban not found', HttpStatus.NOT_FOUND);
		return ret[0];
	}

	/**
	 * @brief Create a ban
	 * @param {string} login The user login
	 * @param {string} chann_name The channel name
	 * @param {string} reason The ban reason
	 * @return {Ban} The created ban
	 * @security Clearance level: admin OR channel owner OR channel admin
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(new AdminOwnerAdminGuard(Number(process.env.ADMIN_CLEARANCE)))
	async createBan(
		@Body('login') login: string,
		@Body('chann_name') chann_name: string,
		@Body('reason') reason: string,
	): Promise<Ban> {
		let chan = await this.channelService.findByName(chann_name);
		if (!chan)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let me = await this.userService.findByLogin(
			'me' /*TODO: check session*/,
		);
		let my_membership = await this.membershipService.findByUserAndChannel(
			me.dataValues.login,
			chann_name,
		);
		if (!my_membership)
			throw new HttpException(
				"User can't ban if he's not in channel",
				HttpStatus.NOT_FOUND,
			);
		if (!my_membership.dataValues.isAdmin)
			throw new HttpException("You can't do this", HttpStatus.FORBIDDEN);
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let membership = await this.membershipService.findByUserAndChannel(
			login,
			chann_name,
		);
		if (!membership)
			throw new HttpException(
				'User not in channel',
				HttpStatus.NOT_FOUND,
			);
		if (membership.dataValues.isAdmin && chan.dataValues.owner !== me)
			throw new HttpException(
				'Cannot ban channel admin',
				HttpStatus.FORBIDDEN,
			);
		let precBans = await this.banService.findByLoginAndChannel(
			login,
			chann_name,
		);
		if (precBans.length > 0)
			throw new HttpException('User already banned', HttpStatus.CONFLICT);
		if (reason.length < 0)
			throw new HttpException('Reason too short', HttpStatus.BAD_REQUEST);
		return this.banService.create({
			user: user,
			channel: chan,
			reason: reason,
		});
	}

	/**
	 * @brief Delete a ban
	 * @param {string} login The user login
	 * @param {string} chann_name The channel name
	 * @return {number} The number of deleted bans
	 * @security Clearance level: admin OR channel owner OR channel admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Delete('user/:login/channel/:chann_name')
	@UseGuards(new AdminOwnerAdminGuard(Number(process.env.ADMIN_CLEARANCE))) //TODO: better guarding
	async delete(
		@Param('login') login: string,
		@Param('chann_name') chann_name: string,
	): Promise<number> {
		let ban = (
			await this.banService.findByLoginAndChannel(login, chann_name)
		)[0];
		if (!ban)
			throw new HttpException('Ban not found', HttpStatus.NOT_FOUND);
		let me = await this.userService.findByLogin(
			'me' /*TODO: check session*/,
		);
		let my_membership = await this.membershipService.findByUserAndChannel(
			me.dataValues.login,
			chann_name,
		);
		if (!my_membership)
			throw new HttpException(
				"User can't unban if he's not in channel",
				HttpStatus.NOT_FOUND,
			);
		if (!my_membership.dataValues.isAdmin)
			throw new HttpException("You can't do this", HttpStatus.FORBIDDEN);
		return this.banService.delete(login, chann_name);
	}
}
