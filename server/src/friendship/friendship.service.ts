import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Friendship } from './friendship.entity';
import { FriendshipDto } from './friendship.dto';
import { Op } from 'sequelize';

@Injectable()
export class FriendshipService {
	constructor(
		@Inject('FRIENDSHIP_REPOSITORY')
		private readonly friendshipRepository: typeof Friendship,
	) {}

	/**
	 * @brief Get all friendships
	 * @returns {Friendship[]} The list of all friendships
	 * @throws {HttpException} 500 - An error has occured
	 */
	async findAll(): Promise<Friendship[]> {
		try {
			return await this.friendshipRepository.findAll<Friendship>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all friendships of a user including pending invitations
	 * @param {string} login The login of the user
	 * @returns {Friendship[]} The total list of friendships
	 * @throws {HttpException} 500 if an error occured
	 */
	async findAllFriends(login: string): Promise<Friendship[]> {
		try {
			return await this.friendshipRepository.findAll<Friendship>({
				where: {
					[Op.or]: [{ senderLogin: login }, { receiverLogin: login }],
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get a friendship by its two friends
	 * @param {string} loginA The login of the first friend
	 * @param {string} loginB The login of the second friend
	 * @returns {Friendship} The friendship
	 * @throws {HttpException} 500 if an error occured
	 */
	async findByBothFriends(
		loginA: string,
		loginB: string,
	): Promise<Friendship> {
		try {
			return await this.friendshipRepository.findOne<Friendship>({
				where: {
					[Op.or]: [
						{
							[Op.and]: [
								{ senderLogin: loginA },
								{ receiverLogin: loginB },
							],
						},
						{
							[Op.and]: [
								{ senderLogin: loginB },
								{ receiverLogin: loginA },
							],
						},
					],
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get a pending friendship invitations by their sender
	 * @param {string} login The login of the sender
	 * @returns {Friendship[]} The list of friendship invitations
	 * @throws {HttpException} 500 if an error occured
	 */
	async findRequests(login: string): Promise<Friendship[]> {
		try {
			return await this.friendshipRepository.findAll<Friendship>({
				where: {
					senderLogin: login,
					isPending: true,
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get a pending friendship invitations by their receiver
	 * @param {string} login The login of the receiver
	 * @returns {Friendship[]} The list of friendship invitations
	 * @throws {HttpException} 500 if an error occured
	 */
	async findInvitations(login: string): Promise<Friendship[]> {
		try {
			return await this.friendshipRepository.findAll<Friendship>({
				where: {
					receiverLogin: login,
					isPending: true,
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all friendships of a user
	 * @param {string} login The login of the user
	 * @returns {Friendship[]} The list of friendships
	 * @throws {HttpException} 500 if an error occured
	 */
	async findFriends(login: string): Promise<Friendship[]> {
		try {
			return await this.friendshipRepository.findAll<Friendship>({
				where: {
					[Op.or]: [{ senderLogin: login }, { receiverLogin: login }],
					isPending: false,
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Create a friendship
	 * @param {FriendshipDto} friendshipDto The friendship to create
	 * @returns {Friendship} The created friendship
	 * @throws {HttpException} 500 if an error occured
	 */
	async create(friendshipDto: FriendshipDto): Promise<Friendship> {
		try {
			let ret = await this.friendshipRepository.create<Friendship>({
				senderLogin: friendshipDto.sender.dataValues.login,
				receiverLogin: friendshipDto.receiver.dataValues.login,
				isPending: friendshipDto.isPending,
			});
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Update a friendship
	 * @param {FriendshipDto} friendshipDto The new value of the friendship
	 * @returns {number} The number of updated rows
	 * @throws {HttpException} 500 if an error occured
	 */
	async update(friendshipDto: FriendshipDto): Promise<number> {
		try {
			return (
				await this.friendshipRepository.update<Friendship>(
					{
						senderLogin: friendshipDto.sender.dataValues.login,
						receiverLogin: friendshipDto.receiver.dataValues.login,
						isPending: friendshipDto.isPending,
					},
					{
						where: {
							receiverLogin:
								friendshipDto.receiver.dataValues.login,
							senderLogin: friendshipDto.sender.dataValues.login,
						},
					},
				)
			)[0];
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Delete a friendship
	 * @param {Friendship} friendship The friendship to delete
	 * @returns {number} The number of deleted rows
	 * @throws {HttpException} 500 if an error occured
	 */
	async delete(friendship: Friendship): Promise<number> {
		try {
			return await this.friendshipRepository.destroy<Friendship>({
				where: {
					senderLogin: friendship.senderLogin,
					receiverLogin: friendship.receiverLogin,
				},
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
