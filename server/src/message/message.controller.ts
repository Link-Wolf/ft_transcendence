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
import { MessageService } from './message.service';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { Message } from './message.entity';
import { UserService } from 'src/user/user.service';
import { ChannelService } from 'src/channel/channel.service';
import { MembershipService } from 'src/membership/membership.service';
import { BanService } from 'src/ban/ban.service';
import { MuteService } from 'src/mute/mute.service';
import { AdminChannelusersGuard } from 'src/guards/admin_channelusers.guard';

@Controller('message')
export class MessageController {
	constructor(
		private readonly messageService: MessageService,
		private readonly userService: UserService,
		private readonly channelService: ChannelService,
		private readonly membershipService: MembershipService,
		private readonly banService: BanService,
		private readonly muteService: MuteService,
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
	@UseGuards(AdminClearanceGuard)
	async getAllMessages(): Promise<Message[]> {
		return this.messageService.findAll();
	}

	/**
	 * @brief Get a message by its id
	 * @param {number} id The message id
	 * @return {Message} The message
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':id')
	@UseGuards(AdminClearanceGuard)
	async getMessageById(
		@Param('id', ParseIntPipe) id: number,
	): Promise<Message> {
		let message = await this.messageService.findById(id);
		if (!message)
			throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
		return message;
	}

	/**
	 * @brief Get messages by channel name
	 * @param {string} chanName The channel name
	 * @return {Message[]} The messages
	 * @security Clearance level: admin OR user member of the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('channel/:chanName')
	@UseGuards(AdminChannelusersGuard)
	async getMessagesByChannel(
		@Param('chanName') chanName: string,
	): Promise<Message[]> {
		let channel = await this.messageService.findByChannel(chanName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		return this.messageService.findByChannel(chanName);
	}

	/**
	 * @brief Get messages by user login
	 * @param {string} userLogin The user login
	 * @return {Message[]} The messages
	 * @security Clearance level: admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:userLogin')
	@UseGuards(AdminClearanceGuard)
	async getMessagesByUser(
		@Param('userLogin') userLogin: string,
	): Promise<Message[]> {
		let user = await this.messageService.findByUser(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.messageService.findByUser(userLogin);
	}

	/**
	 * @brief Get messages by user login and channel name
	 * @param {string} userLogin The user login
	 * @param {string} chanName The channel name
	 * @return {Message[]} The messages
	 * @security Clearance level: admin OR user member of the channel
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:userLogin/channel/:chanName')
	@UseGuards(AdminChannelusersGuard)
	async getMessagesByUserAndChannel(
		@Param('userLogin') userLogin: string,
		@Param('chanName') chanName: string,
	): Promise<Message[]> {
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
	 * @param {string} content The message content
	 * @param {string} userLogin The user login
	 * @param {string} chanName The channel name
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
	@UseGuards(AdminChannelusersGuard)
	async createMessage(
		@Body('content') content: string,
		@Body('userLogin') userLogin: string,
		@Body('chanName') chanName: string,
	): Promise<Message> {
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let channel = await this.channelService.findByName(chanName);
		if (!channel)
			throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
		let membership = await this.membershipService.findByUserAndChannel(
			userLogin,
			chanName,
		);
		if (!membership)
			throw new HttpException(
				'User is not a member of the channel',
				HttpStatus.FORBIDDEN,
			);
		let ban = await this.banService.findByLoginAndChannel(
			userLogin,
			chanName,
		);
		if (ban.length > 0)
			throw new HttpException(
				'User is banned from the channel',
				HttpStatus.FORBIDDEN,
			);
		let mute = await this.muteService.findByLoginAndChannel(
			userLogin,
			chanName,
		);
		if (mute.length > 0)
			throw new HttpException(
				'User is muted from the channel',
				HttpStatus.FORBIDDEN,
			);
		if (!content || content.length === 0)
			throw new HttpException('Content is empty', HttpStatus.BAD_REQUEST);
		let ret = await this.messageService.create({
			content: content,
			user: user,
			channel: channel,
			date: new Date(Date.now()),
		});
		return ret;
	}

	/**
	 * @brief Delete a message by its id
	 * @param {number} id The message id
	 * @return {number} The number of deleted messages
	 * @security Clearance level: admin OR admin of the channel OR owner OR user who created the message
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':id')
	@UseGuards(AdminClearanceGuard) //TODO: suite guards
	async deleteMessage(
		@Param('id', ParseIntPipe) id: number,
	): Promise<number> {
		let message = await this.messageService.findById(id);
		if (!message)
			throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
		return await this.messageService.delete(id);
	}
}
