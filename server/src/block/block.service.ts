import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BlockDto } from './block.dto';
import { Block } from './block.entity';

@Injectable()
export class BlockService {
	constructor(
		@Inject('BLOCK_REPOSITORY')
		private readonly blockRepository: typeof Block,
	) {}

	/**
	 * @brief Get all blocks
	 * @return {Block[]} All blocks
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findAll(): Promise<Block[]> {
		try {
			return await this.blockRepository.findAll<Block>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all blocks where the blocked is the login's user
	 * @param {string} login The user's login
	 * @return {Block[]} All blocks of the user
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findBlockersOf(login: string): Promise<Block[]> {
		try {
			return await this.blockRepository.findAll<Block>({
				where: { blocked: login },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all blocks where the blocker is the login's user
	 * @param {string} login The user's login
	 * @return {Block[]} All blocks by the user
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findBlocksBy(login: string): Promise<Block[]> {
		try {
			return await this.blockRepository.findAll<Block>({
				where: { blockerLogin: login },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Get all blocks from one specific user and to another specific one
	 * @param {string} blockerLogin The blocker's login
	 * @param {string} blockedLogin The blocked's login
	 * @return {Block} The block
	 * @throws {HttpException} 500 - Internal server error
	 */
	async findBlockByBothLogin(
		blockerLogin: string,
		blockedLogin: string,
	): Promise<Block> {
		try {
			console.log(blockerLogin, blockedLogin);
			return await this.blockRepository.findOne<Block>({
				where: {
					blockerLogin: blockerLogin,
					blockedLogin: blockedLogin,
				},
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Create a block
	 * @param {BlockDto} blockDto The block to create
	 * @return {Block} The created block
	 * @throws {HttpException} 500 - Internal server error
	 */
	async create(blockDto: BlockDto): Promise<Block> {
		try {
			console.log(blockDto);
			let ret = await this.blockRepository.create<Block>(blockDto);
			console.log('NON');
			await ret.$set('blocker', blockDto.blocker);
			await ret.$set('blocked', blockDto.blocked);
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief Delete a block
	 * @param {BlockDto} blockDto The block to delete
	 * @return {number} The number of deleted rows
	 * @throws {HttpException} 500 - Internal server error
	 */
	async delete(blockDto: BlockDto): Promise<number> {
		try {
			return await this.blockRepository.destroy({
				where: { blocked: blockDto.blocked, blocker: blockDto.blocker },
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
