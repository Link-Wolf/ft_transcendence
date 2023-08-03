import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { Channel } from './channel.entity';
import { ChannelDto } from './channel.dto';

@Injectable()
export class ChannelService {
	constructor(
		@Inject('CHANNEL_REPOSITORY')
		private readonly channelRepository: typeof Channel,
	) {}

	/**
	 * @brief Get all channels
	 * @return {Channel[]} All channels
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findAll(): Promise<Channel[]> {
		try {
			return await this.channelRepository.findAll<Channel>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get a channel by its name
	 * @param {string} name The channel's name
	 * @return {Channel} The channel
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByName(name: string): Promise<Channel> {
		try {
			return await this.channelRepository.findOne<Channel>({
				where: { name: name },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all public channels
	 * @return {Channel[]} All public channels
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findPublic(): Promise<Channel[]> {
		try {
			return await this.channelRepository.findAll<Channel>({
				where: { isPrivate: false },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all public channels except those where the user is already
	 * @return {Channel[]} All public channels
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findPublicWithoutMine(login: string): Promise<Channel[]> {
		try {
			let ret = await this.channelRepository.findAll<Channel>({
				where: { isPrivate: false },
				include: [{ all: true }],
			});
			return ret.filter(
				(channel) =>
					channel.dataValues.memberships.filter(
						(membership) =>
							membership.dataValues.userLogin === login,
					).length === 0,
			);
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all channels where the login's user is the owner
	 * @param {string} login The user's login
	 * @return {Channel[]} All channels of the user
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByOwner(login: string): Promise<Channel[]> {
		try {
			return await this.channelRepository.findAll<Channel>({
				where: { owner: login, isPrivate: false },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Verify if the user is the owner of the channel
	 * @param {string} login The user's login
	 * @param {string} channelName The channel's name
	 * @return {boolean} True if the user is the owner, false otherwise
	 * @throws {HttpException} 500 - Internal server error
	 */
	async isOwner(login: string, channelName: string): Promise<boolean> {
		try {
			const channel = await this.channelRepository.findOne<Channel>({
				where: { name: channelName },
				include: [{ all: true }],
			});
			return channel.owner.dataValues.login === login;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all channels where the password is the same as pass2check
	 *        (yeah it's a really bad idea to prevent same password for different
	 *        channels but it's for fun, trust)
	 * @param {string} pass2check The channel's password
	 * @return {Channel[]} All channels where the password is pass2check
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByPassword(pass2check: string): Promise<Channel[]> {
		try {
			return await this.channelRepository.findAll<Channel>({
				where: { password: pass2check },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all private channels where the login's user is a member
	 * @param {string} login The user's login
	 * @return {Channel[]} All private channels of the user
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findDM(login: string): Promise<Channel[]> {
		try {
			let channels = await this.channelRepository.findAll<Channel>({
				where: { isPrivate: true },
				include: [{ all: true }],
			});
			return channels.filter(
				(channel) =>
					channel.dataValues.memberships.filter(
						(membership) =>
							membership.dataValues.userLogin === login,
					).length > 0,
			);
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Create a channel
	 * @param {ChannelDto} channelDto The channel to create
	 * @return {Channel} The created channel
	 * @throws {HttpException} 500 - Internal server error
	 */
	async create(channelDto: ChannelDto): Promise<Channel> {
		try {
			let ret = await this.channelRepository.create<Channel>(channelDto);
			await ret.$set('owner', channelDto.owner);
			return ret;
		} catch (error) {
			console.log(error);
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Update a channel
	 * @param {ChannelDto} channelDto The channel to update
	 * @return {number} The number of updated rows
	 * @throws {HttpException} 500 - Internal server error
	 */
	async update(channelDto: ChannelDto): Promise<number> {
		try {
			return await this.channelRepository.update<Channel>(channelDto, {
				where: { name: channelDto.name },
			})[0];
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Delete a channel
	 * @param {string} name The channel's name
	 * @return {number} The number of deleted rows
	 * @throws {HttpException} 500 - Internal server error
	 */
	async delete(name: string): Promise<number> {
		try {
			return await this.channelRepository.destroy({
				where: { name: name },
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
