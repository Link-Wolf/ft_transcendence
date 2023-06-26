import {
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	Post,
	UseGuards,
	Body,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { Channel } from './channel.entity';
import { UserService } from 'src/user/user.service';
import { PublicOrPrivateGuard } from 'src/guards/public_or_private.guard';
import { AdminUserGuard } from 'src/guards/admin_user.guard';
import { AdminOwnerGuard } from 'src/guards/admin_owner.guard';

@Controller('channel')
export class ChannelController {
	constructor(
		private readonly channelService: ChannelService,
		private readonly userService: UserService,
	) {}

	/**
	 * @brief Get all channels
	 * @returns {Channel[]} All channels
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getAll(): Promise<Channel[]> {
		return await this.channelService.findAll();
	}

	/**
	 * @brief Get all public channels
	 * @returns {Channel[]} All public channels
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 500 - Internal Server Error
	 */
	@Get('public')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_USER)))
	async getPublic(): Promise<Channel[]> {
		return await this.channelService.findPublic();
	}

	/**
	 * @brief Get a channel by name
	 * @param {string} name The channel name
	 * @returns {Channel} The channel
	 * @security Clearance admin if private, user if public
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':name')
	@UseGuards(new PublicOrPrivateGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getByName(@Param('name') name: string): Promise<Channel> {
		let channel = await this.channelService.findByName(name);
		if (!channel)
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		return channel;
	}

	/**
	 * @brief Get all public channels owned by a user
	 * @param {string} owner The user's login
	 * @returns {Channel[]} All channels owned by the user
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('owner/:owner')
	@UseGuards(new AdminUserGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getByOwner(@Param('owner') owner: string): Promise<Channel[]> {
		let user = await this.userService.findByLogin(owner);
		if (!user)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		return await this.channelService.findByOwner(owner);
	}

	/**
	 * @brief Create a channel
	 * @param {string} ownerLogin The owner's login
	 * @param {string} name The channel name
	 * @param {string} password The channel password
	 * @returns {Channel} The created channel
	 * @security Clearance user
	 * @response 201 - Created
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post() //TODO: need very much testing cause looks ugly af
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_USER)))
	async create(
		@Body('ownerLogin') ownerLogin: string,
		@Body('name') name: string,
		@Body('password') password?: string,
	): Promise<Channel> {
		let owner = await this.userService.findByLogin(ownerLogin);
		if (!owner)
			throw new HttpException('Owner not Found', HttpStatus.NOT_FOUND);
		let chan_with_pass = await this.channelService.findByPassword(password);
		if (password && chan_with_pass.length != 0)
			throw new HttpException(
				'Password already in use',
				HttpStatus.CONFLICT,
			);
		if (!name.match(/^[a-zA-Z0-9]+$/))
			throw new HttpException(
				'Invalid channel name',
				HttpStatus.BAD_REQUEST,
			);
		if (await this.channelService.findByName(name))
			throw new HttpException(
				'Channel name already in use',
				HttpStatus.CONFLICT,
			);
		return await this.channelService.create({
			isPrivate: false,
			name: name,
			password: password,
			owner: owner,
		});
	}

	/**
	 * @brief Update a channel
	 * @param {string} name The channel name
	 * @param {string} password The channel password
	 * @returns {number} The number of rows affected
	 * @security Clearance admin OR owner of channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Patch(':name')
	@UseGuards(new AdminOwnerGuard(Number(process.env.CLEARANCE_ADMIN))) //TODO: better guard
	async update(
		@Param('name') name: string,
		@Body('password') password?: string,
	): Promise<Number> {
		//COMBAK: not done
		let channel = await this.channelService.findByName(name);
		if (!channel)
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		if (channel.isPrivate)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		if (password && (await this.channelService.findByPassword(password)))
			throw new HttpException(
				'Password already in use',
				HttpStatus.CONFLICT,
			);
		return this.channelService.update({ name: name, password: password });
	}

	/**
	 * @brief Delete a channel
	 * @param {string} name The channel name
	 * @returns {number} The number of rows affected
	 * @security Clearance admin OR owner of channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':name')
	@UseGuards(new AdminOwnerGuard(Number(process.env.CLEARANCE_ADMIN)))
	async delete(@Param('name') name: string): Promise<Number> {
		if (!(await this.channelService.findByName(name)))
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		return this.channelService.delete(name);
	}
}
