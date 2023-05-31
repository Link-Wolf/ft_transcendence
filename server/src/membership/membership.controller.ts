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
	ParseBoolPipe
} from '@nestjs/common';
import { ClearanceGuard } from '../guards/clearance.guard';
import { MembershipService } from './membership.service';
import { UserService } from '../user/user.service';
import { Membership } from './membership.entity';
import { ChannelService } from '../channel/channel.service';

@Controller('membership')
export class MembershipController {
	constructor(
		private membershipService: MembershipService,
		private userService: UserService,
		private channelService: ChannelService
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
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async getAll(): Promise<Membership[]>
	{
		return this.membershipService.getAll();
	}

	/**
	 * @brief Get all memberships of a user
	 * @return {Membership[]} All memberships of a user
	 * @security Clearance admin or being the user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))//TODO: Better guarding
	async getByUser(@Param('login') login: string): Promise<Membership[]>
	{
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByUser(login);
	}

	/**
	 * @brief Get all memberships of a channel
	 * @return {Membership[]} All memberships of a channel
	 * @security Clearance admin or being in the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('channel/:chan_name')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))//TODO: Better guarding
	async getByChannel(@Param('chan_name') chan_name: string): Promise<Membership[]>
	{
		if(!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByChannel(chan_name);
	}
	/**
	 * @brief Get a membership by user and channel
	 * @return {Membership} The membership
	 * @security Clearance admin or being the user or being in the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login/channel/:chan_name')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))//TODO: Better guarding
	async getByUserAndChannel(
		@Param('login') login: string,
		@Param('chan_name') chan_name: string
	): Promise<Membership>
	{
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if(!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.membershipService.findByUserAndChannel(login, chan_name);
	}




	@Get('user/:login/bans')



	@Get('user/:login/mutes')




	@Get('user/:login/mutes/channel/:chan_name')





	/**
	 * @brief Create a membership
	 * @return {Membership} The created membership
	 * @security Clearance admin or being the user
	 * @response 201 - Created
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 * @param 
	 */
	@Post()
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE))) //TODO: Better guarding
	async create(
		@Body('channelName') channelName: string,
		@Body('userLogin') userLogin: string,
		@Body('isOwner', ParseBoolPipe) isOwner: boolean = false,
		@Body('isAdmin', ParseBoolPipe) isAdmin: boolean = false,
	): Promise<Membership>
	{
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		if (isOwner)
			isAdmin = true;
		if (this.membershipService.findByUserAndChannel(userLogin, channelName))
			throw new HttpException('Membership already exists', HttpStatus.CONFLICT);
		return this.membershipService.create({
			user: user,
			channel: channel,
			isOwner: isOwner,
			isAdmin: isAdmin
		});
	}

	/**
	 * @brief Update a membership
	 * 
	 * @return {number} The number of updated memberships (technically)
	 * @security Clearance admin or being admin in the channel
	 */
	@Patch('user/:login/channel/:chan_name')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE))) //TODO: Better guarding
	async update(
		@Param('login') userLogin: string,
		@Param('chan_name') channelName: string,
		@Body('isAdmin', ParseBoolPipe) isAdmin?: boolean,
		@Body('banTimeout' /*TODO: ParseDatePipe*/) banTimeout?: Date,
		@Body('banReason') banReason?: string,
		@Body('muteTimeout' /*TODO: ParseDatePipe*/) muteTimeout?: Date,
		@Body('muteReason') muteReason?: string
	): Promise<number>
	{
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(channelName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		if (!this.membershipService.findByUserAndChannel(userLogin, channelName))
			throw new HttpException('Membership not found', HttpStatus.NOT_FOUND);
		
	}

	@Delete('user/:login/channel/:chan_name')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE))) //TODO: Better guarding
	async delete(
		@Param('login') login: string,
		@Param('chan_name') chan_name: string) 
	{
		if (!this.userService.findByLogin(login))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		if(!this.channelService.findByName(chan_name))
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.membershipService.delete(login, chan_name);
	}
}
