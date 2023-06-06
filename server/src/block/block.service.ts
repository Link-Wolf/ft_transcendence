import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BlockDto } from './block.dto';
import { Block } from './block.entity';

@Injectable()
export class BlockService {
    constructor(
        @Inject('BLOCK_REPOSITORY')
        private readonly blockRepository: typeof Block,
    ) { }

    /**
     * @brief Get all blocks
     * @return {Promise<Block[]>} All blocks
     * @throws {HttpException} 500 - Internal server error
     */
    async findAll(): Promise<Block[]> {
        try {
            return await this.blockRepository.findAll<Block>({ include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get all blocks where the blocked is the login's user
     * @param login The user's login
     * @return Promise<Block[]> All blocks of the user
     * @throws {HttpException} 500 - Internal server error
     */
    async findBlockersOf(login: string): Promise<Block[]> {
        try {
            return await this.blockRepository.findAll<Block>({ where: { blocked: login }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get all blocks where the blocker is the login's user
     * @param login The user's login
     * @return Promise<Block[]> All blocks by the user
     * @throws {HttpException} 500 - Internal server error
     */
    async findBlocksBy(login: string): Promise<Block[]> {
        try {
            return await this.blockRepository.findAll<Block>({ where: { blocker: login }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Create a block
     * @param blockDto The block to create
     * @return Promise<Block> The created block
     * @throws {HttpException} 500 - Internal server error
     */
    async create(blockDto: BlockDto): Promise<Block> {
        try {
            let ret = await this.blockRepository.create<Block>(blockDto);
            await ret.$set('blocker', blockDto.blocker);
            await ret.$set('blocked', blockDto.blocked);
            return ret;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Delete a block
     * @param blockDto The block to delete
     * @return Promise<number> The number of deleted rows
     * @throws {HttpException} 500 - Internal server error
     */
    async delete(blockDto: BlockDto): Promise<number> {
        try {
            return await this.blockRepository.destroy({ where: { blocked: blockDto.blocked, blocker: blockDto.blocker } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

