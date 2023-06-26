import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ChannelService } from 'src/channel/channel.service';
import { MembershipService } from 'src/membership/membership.service';
import { UserService } from 'src/user/user.service';
import { MuteService } from './mute.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { Mute } from './mute.entity';
import { ParseDatePipe } from './mute.pipe';

@Controller('mute')
export class MuteController {
	constructor(
		private readonly muteService: MuteService,
		private readonly membershipService: MembershipService,
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
	) {}

	/**
	 * @brief Get all mutes
	 * @return {Mute[]} All mutes
	 * @security Admin only
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async findAll(): Promise<Mute[]> {
		return this.muteService.findAll();
	}

	/**
	 * @brief Get a mute by its id
	 * @param id The mute id
	 * @return {Mute} The mute
	 * @security Admin only OR admin of the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Get(':id')
	@UseGuards(AdminClearanceGuard)
	async findOne(@Param('id', ParseIntPipe) id: number): Promise<Mute> {
		let ret = this.muteService.findById(id);
		if (!ret)
			throw new HttpException('Mute not found', HttpStatus.NOT_FOUND);
		return ret;
	}

	/**
	 * @brief Get mutes by user login
	 * @param {string} login The user login
	 * @return {Mute} All mute of the user
	 * @security Admin only
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login')
	@UseGuards(AdminClearanceGuard)
	async findByUser(@Param('login') login: string): Promise<Mute[]> {
		const user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.muteService.findByLogin(login);
	}

	/**
	 * @brief Get all mute in a channel
	 * @param {string} channelName The channel name
	 * @return {Mute} The mute
	 * @security Admin only OR an admin of the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Get('channel/:channelName')
	@UseGuards(AdminClearanceGuard)
	async findByChannel(
		@Param('channelName') channelName: string,
	): Promise<Mute[]> {
		const channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.muteService.findByChannel(channelName);
	}

	/**
	 * @brief Get all mutes of a user in a channel
	 * @param {string} login The user login
	 * @param {string} channelName The channel name
	 * @return {Mute[]} The mutes
	 * @security Admin only OR channel admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login/channel/:channelName')
	@UseGuards(AdminClearanceGuard)
	async findByUserAndChannel(
		@Param('login') login: string,
		@Param('channelName') channelName: string,
	): Promise<Mute[]> {
		const user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		const channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.muteService.findByLoginAndChannel(login, channelName);
	}

	/**
	 * @brief Create a mute
	 * @param {string} login The user login
	 * @param {string} channelName The channel name
	 * @param {date} end The end date
	 * @param {string} reason The reason
	 * @return {Mute} The mute
	 * @security Admin only OR channel admin
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminClearanceGuard)
	async create(
		@Body('login') login: string,
		@Body('channelName') channelName: string,
		@Body('end', ParseDatePipe) end: Date,
		@Body('reason') reason: string,
	): Promise<Mute> {
		let me = await this.userService.findByLogin('me' /* TODO: session */);
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let my_membership = await this.membershipService.findByUserAndChannel(
			me.dataValues.login,
			channelName,
		);
		if (!my_membership)
			throw new HttpException(
				"User can't mute if he's not in channel",
				HttpStatus.FORBIDDEN,
			);
		let user_membership = await this.membershipService.findByUserAndChannel(
			login,
			channelName,
		);
		if (!user_membership)
			throw new HttpException(
				'User not in channel',
				HttpStatus.FORBIDDEN,
			);
		if (!my_membership.dataValues.isAdmin)
			throw new HttpException("You can't do this", HttpStatus.FORBIDDEN);
		if (
			user_membership.dataValues.isAdmin &&
			channel.dataValues.owner != user
		)
			throw new HttpException(
				'Cannot mute channel admin',
				HttpStatus.FORBIDDEN,
			);
		let old_mute = await this.muteService.findByLoginAndChannel(
			login,
			channelName,
		);
		if (old_mute.some((mute) => mute.dataValues.end > new Date()))
			throw new HttpException('User already muted', HttpStatus.CONFLICT);
		if (reason.length < 0)
			throw new HttpException('Reason too short', HttpStatus.BAD_REQUEST);
		return this.muteService.create({
			user: user,
			channel: channel,
			end: end,
			reason: reason,
		});
	}

	/**
	 * @brief Delete a mute
	 * @param {number} id The mute id
	 * @return {number} The number of deleted mutes
	 * @security Admin only OR channel admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':id')
	@UseGuards(AdminClearanceGuard)
	async delete(@Param('id', ParseIntPipe) id: number): Promise<number> {
		let ret = await this.muteService.findById(id);
		if (!ret)
			throw new HttpException('Mute not found', HttpStatus.NOT_FOUND);
		let me = await this.userService.findByLogin('me' /* TODO: session */);
		let my_membership = await this.membershipService.findByUserAndChannel(
			me.dataValues.login,
			ret.dataValues.channelName,
		);
		if (!my_membership)
			throw new HttpException(
				"User can't mute if he's not in channel",
				HttpStatus.FORBIDDEN,
			);
		if (!my_membership.dataValues.isAdmin)
			throw new HttpException("You can't do this", HttpStatus.FORBIDDEN);
		return await this.muteService.delete(id);
	}
}
