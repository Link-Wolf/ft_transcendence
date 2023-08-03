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
	Req,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { Channel } from './channel.entity';
import { UserService } from 'src/user/user.service';
import { PublicOrPrivateGuard } from 'src/guards/public_or_private.guard';
import {
	AdminUserGuard,
	AdminUserGuardPost,
} from 'src/guards/admin_user.guard';
import { AdminOwnerGuard } from 'src/guards/admin_owner.guard';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

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
	@UseGuards(AdminClearanceGuard)
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
	@UseGuards(UserClearanceGuard)
	async getPublic(): Promise<Channel[]> {
		return await this.channelService.findPublic();
	}

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
		let senderLogin = jwt.verify(
			req.cookies.token,
			process.env.JWT_KEY,
		).login;
		let sender = await this.userService.findByLogin(senderLogin);
		if (!sender)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return await this.channelService.findPublicWithoutMine(sender.login);
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
	@UseGuards(PublicOrPrivateGuard)
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
	@UseGuards(AdminUserGuard)
	async getByOwner(@Param('owner') owner: string): Promise<Channel[]> {
		let user = await this.userService.findByLogin(owner);
		if (!user)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		return await this.channelService.findByOwner(owner);
	}

	/**
	 * @brief Get all private channels of a user
	 * @param {string} login The user's login
	 * @returns {Channel[]} All private channels of the user
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('dm/:login')
	@UseGuards(AdminUserGuard)
	async getDM(@Param('login') login: string): Promise<Channel[]> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		return await this.channelService.findDM(login);
	}

	/**
	 * @brief Create a channel
	 * @param {string} ownerLogin The owner's login
	 * @param {string} name The channel name
	 * @param {string} password The channel password
	 * @returns {Channel} The created channel
	 * @security Admin clearance OR user himself
	 * @response 201 - Created
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminUserGuardPost)
	async create(
		@Body('userLogin') ownerLogin: string,
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
	@UseGuards(AdminOwnerGuard)
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
	@UseGuards(AdminOwnerGuard)
	async delete(@Param('name') name: string): Promise<Number> {
		if (!(await this.channelService.findByName(name)))
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		return this.channelService.delete(name);
	}
}
