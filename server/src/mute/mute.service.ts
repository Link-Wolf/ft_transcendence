import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Mute } from './mute.entity';
import { MuteDto } from './mute.dto';

@Injectable()
export class MuteService {
	constructor(
		@Inject('MUTE_REPOSITORY')
		private readonly muteRepository: typeof Mute,
	) {}

	/**
	 * @brief Find all mutes
	 * @return {Mute[]} A list of mutes
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findAll(): Promise<Mute[]> {
		try {
			return await this.muteRepository.findAll<Mute>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Find a mute by its id
	 * @param {number} id The mute's id
	 * @return {Mute} The mute
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findById(id: number): Promise<Mute> {
		try {
			return await this.muteRepository.findByPk<Mute>(id, {
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Find all mutes of a user
	 * @param {string} login The user's login
	 * @return {Mute[]} A list of mutes
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByLogin(login: string): Promise<Mute[]> {
		try {
			return await this.muteRepository.findAll<Mute>({
				where: { userLogin: login },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Find all mutes of a channel
	 * @param {string} channelName The channel's name
	 * @return {Mute[]} A list of mutes
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByChannel(channelName: string): Promise<Mute[]> {
		try {
			return await this.muteRepository.findAll<Mute>({
				where: { channelName: channelName },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Find all mutes of a user in a channel
	 * @param {string} login The user's login
	 * @param {string} channelName The channel's name
	 * @return {Mute[]} A list of mutes
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findByLoginAndChannel(
		login: string,
		channelName: string,
	): Promise<Mute[]> {
		try {
			return await this.muteRepository.findAll<Mute>({
				where: { userLogin: login, channelName: channelName },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Create a mute
	 * @param {MuteDto} mute The mute to create
	 * @return {Mute} The created mute
	 * @throws {HttpException} 500 - Internal server error
	 */
	async create(mute: MuteDto): Promise<Mute> {
		try {
			let ret = await this.muteRepository.create<Mute>(mute);
			await ret.$set('user', mute.user);
			await ret.$set('channel', mute.channel);
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Delete a mute
	 * @param {number} id The mute's id
	 * @return {number} The number of deleted rows
	 * @throws {HttpException} 500 - Internal server error
	 */
	async delete(id: number): Promise<number> {
		try {
			return await this.muteRepository.destroy({ where: { id: id } });
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
