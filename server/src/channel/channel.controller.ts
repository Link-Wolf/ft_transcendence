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
	Body
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { Channel } from './channel.entity';
import { UserService } from 'src/user/user.service';
import { ParseBoolPipe } from './channel.pipe';
import { MembershipService } from 'src/membership/membership.service';

@Controller('channel')
export class ChannelController {
	constructor(
		private channelService: ChannelService,
		private userService: UserService,
	) { }
	
	/**
	 * @breif Get all channels
	 * @returns {Channel[]} All channels
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getAll(): Promise<Channel[]>
	{
		return await this.channelService.findAll();
	}
	
	/**
	 * @breif Get all public channels
	 * @returns {Channel[]} All public channels
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 500 - Internal Server Error
	 */
	@Get('public')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_USER)))
	async getPublic(): Promise<Channel[]>
	{
		return await this.channelService.findPublic();
	}
	
	/**
	 * @breif Get a channel by name
	 * @returns {Channel} The channel
	 * @security Clearance admin if private, user if public
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':name')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getByName(
		@Param('name') name: string
	): Promise<Channel>
	{
		let channel = await this.channelService.findByName(name);
		if (!channel)
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		return channel;		
	}
	
	/**
	 * @breif Get all public channels owned by a user
	 * @returns {Channel[]} All channels owned by the user
	 * @security Clearance public
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('owner/:owner')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async getByOwner(
		@Param('owner') owner: string
	): Promise<Channel[]>
	{
		let user = await this.userService.findByLogin(owner);
		if (!user)
			throw new HttpException('User not Found', HttpStatus.NOT_FOUND);
		return await this.channelService.findByOwner(owner);
	}

	/**
	 * @breif Create a channel
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
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async create(
		@Body('ownerLogin') ownerLogin: string,
		@Body('name') name: string,
		@Body('password') password?: string,
	): Promise<Channel>
	{
		let owner = await this.userService.findByLogin(ownerLogin);
		if (!owner)
			throw new HttpException('Owner not Found', HttpStatus.NOT_FOUND);
		let chan_with_pass = await this.channelService.findByPassword(password);
		if (password && chan_with_pass.length != 0)
			throw new HttpException('Password already in use', HttpStatus.CONFLICT);
		if (name[0] == '_')
			throw new HttpException('Channel name cannot start with _', HttpStatus.BAD_REQUEST);
		if (await this.channelService.findByName(name))
			throw new HttpException('Channel name already in use', HttpStatus.CONFLICT);
		return this.channelService.create({
			isPrivate: false,
			name: name,
			password: password,
			owner: owner
		});
	}

	/**
	 * @breif Update a channel
	 * @returns {number} The number of rows affected
	 * @security Clearance admin or owner of channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Patch(':name')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))//TODO: better guard
	async update(
		@Param('name') name: string,
		@Body('password') password?: string,
	): Promise<Number>
	{
		//COMBAK: not done
		let channel = await this.channelService.findByName(name);
		if (!channel)
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		if (channel.isPrivate)
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		if (password && await this.channelService.findByPassword(password))
			throw new HttpException('Password already in use', HttpStatus.CONFLICT);
		return this.channelService.update({name: name, password: password});
	}
	
	/**
	 * @breif Delete a channel
	 * @security Clearance admin or owner of channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':name')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_ADMIN)))
	async delete(
		@Param('name') name: string
	): Promise<Number>
	{
		if (!(await this.channelService.findByName(name)))
			throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
		return this.channelService.delete(name);
	}
}