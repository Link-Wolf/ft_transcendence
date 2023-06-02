import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { Message } from './message.entity';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/channel/channel.service';
import { MembershipService } from 'src/membership/membership.service';
import { BanService } from 'src/ban/ban.service';
import { MuteService } from 'src/mute/mute.service';

@Controller('message')
export class MessageController {
	constructor(
		private readonly messageService: MessageService,
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
		private readonly membershipService: MembershipService,
		private readonly banService: BanService,
		private readonly muteService: MuteService
	) {}
	
	/**
	 * @brief Get all messages
	 * @return {Message[]} All messages
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async getAllMessages(): Promise<Message[]>
	{
		return this.messageService.findAll();
	}

	/**
	 * @brief Get a message by its id
	 * @param id The message id
	 * @return {Message} The message
	 * @security Clearance level: admin OR user member of the channel where the message was posted
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':id')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async getMessageById(
		@Param('id', ParseIntPipe) id: number
	): Promise<Message>
	{
		let message = await this.messageService.findById(id);
		if (!message)
			throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
		return message;
	}

    /**
     * @brief Get messages by channel name
     * @param chanName The channel name
     * @return {Message[]} The messages
     * @security Clearance level: admin OR user member of the channel
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
	@Get('channel/:chanName')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async getMessagesByChannel(
		@Param('chanName') chanName: string
	): Promise<Message[]>
	{
		let channel = await this.messageService.findByChannel(chanName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.messageService.findByChannel(chanName);
	}

    /**
     * @brief Get messages by user login
     * @param userLogin The user login
     * @return {Message[]} The messages
     * @security Clearance level: admin OR the user itself
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
	@Get('user/:userLogin')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async getMessagesByUser(
		@Param('userLogin') userLogin: string
	): Promise<Message[]>
	{
		let user = await this.messageService.findByUser(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.messageService.findByUser(userLogin);
	}

    /**
     * @brief Get messages by user login and channel name
     * @param userLogin The user login
     * @param chanName The channel name
     * @return {Message[]} The messages
     * @security Clearance level: admin OR user member of the channel
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
	@Get('user/:userLogin/channel/:chanName')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async getMessagesByUserAndChannel(
		@Param('userLogin') userLogin: string,
		@Param('chanName') chanName: string
	): Promise<Message[]>
	{
		let user = await this.messageService.findByUser(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.messageService.findByChannel(chanName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.messageService.findByUserAndChannel(userLogin, chanName);
	}

    /**
     * @brief Create a message
     * @param content The message content
     * @param userLogin The user login
     * @param chanName The channel name
     * @return {Message} The message
     * @security Clearance level: admin OR user member of the channel
     * @response 200 - OK
     * @response 400 - Bad Request
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
	@Post()
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async createMessage(
		@Body('content') content: string,
		@Body('userLogin') userLogin: string,
		@Body('chanName') chanName: string
	): Promise<Message>
	{
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(chanName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let membership = await this.membershipService.findByUserAndChannel(userLogin, chanName);
		if (!membership)
			throw new HttpException('User is not a member of the channel', HttpStatus.FORBIDDEN);
		let ban = await this.banService.findByLoginAndChannel(userLogin, chanName);
		if (ban.length > 0)
			throw new HttpException('User is banned from the channel', HttpStatus.FORBIDDEN);
		let mute = await this.muteService.findByLoginAndChannel(userLogin, chanName);
		if (mute.length > 0)
			throw new HttpException('User is muted from the channel', HttpStatus.FORBIDDEN);
		if (!content || content.length === 0)
			throw new HttpException('Content is empty', HttpStatus.BAD_REQUEST);
		return this.messageService.create({
			content: content,
			user: user,
			channel: channel,
			date: new Date(Date.now())
		});
	}

    /**
     * @brief Delete a message by its id
     * @param id The message id
     * @security Clearance level: admin OR admin of the channel OR user who created the message
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
	@Delete(':id')
	@UseGuards(new ClearanceGuard(Number(process.env.CLEARANCE_LEVEL_ADMIN)))
	async deleteMessage(
		@Param('id', ParseIntPipe) id: number
	): Promise<void>
	{
		let message = await this.messageService.findById(id);
		if (!message)
			throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
		await this.messageService.delete(id);
	}
}
