import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Ban } from './ban.entity';
import { BanDto } from './ban.dto';

@Injectable()
export class BanService {

    constructor(
        @Inject('BAN_REPOSITORY')
        private readonly banRepository: typeof Ban,
    ) { }
	
    /**
     * @brief Find all bans
     * @return {Ban[]} A list of bans
     * @throws {HttpException} 500 - Internal server error
     */
    async findAll(): Promise<Ban[]> {
        try {
            return await this.banRepository.findAll<Ban>({ include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find a ban by its id
     * @param {number} id The ban's id
     * @return {Ban} The ban
     * @throws {HttpException} 500 - Internal server error
     */
    async findById(id: number): Promise<Ban> {
        try {
            return await this.banRepository.findByPk<Ban>( id , { include: [{ all: true }] });
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all bans of a user
     * @param {string} login The user's login 
     * @return {Ban[]} A list of bans
     * @throws {HttpException} 500 - Internal server error
     */
    async findByLogin(login: string): Promise<Ban[]> {
        try {
            return await this.banRepository.findAll<Ban>({ where: { userLogin: login }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all bans of a channel
     * @param {string} channelName The channel's name
     * @return {Ban[]} A list of bans
     * @throws {HttpException} 500 - Internal server error
     */
    async findByChannel(channelName: string): Promise<Ban[]> {
        try {
            return await this.banRepository.findAll<Ban>({ where: { channelName: channelName }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all bans of a user in a channel
     * @param {string} login The user's login
     * @param {string} channelName The channel's name
     * @return {Ban[]} A list of bans
     * @throws {HttpException} 500 - Internal server error
     */
    async findByLoginAndChannel(login: string, channelName: string): Promise<Ban[]> {
        try {
            return await this.banRepository.findAll<Ban>({ where: { userLogin: login, channelName: channelName }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Create a ban
     * @param {BanDto} ban The ban to create
     * @return {Ban} The created ban
     * @throws {HttpException} 500 - Internal server error
     */
    async create(ban: BanDto): Promise<Ban> {
        try {
            let ret = await this.banRepository.create<Ban>(ban);
            await ret.$set('user', ban.user);
            await ret.$set('channel', ban.channel);
            return ret;
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Delete a ban
     * @param {string} login The user's login
     * @param {string} channelName The channel's name
     * @return {number} The number of deleted bans
     * @throws {HttpException} 500 - Internal server error
     */
    async delete(login: string, channelName: string): Promise<number> {
        try {
            return await this.banRepository.destroy({ where: { userLogin:login, channelName: channelName } });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
