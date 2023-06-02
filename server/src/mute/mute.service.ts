import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Mute } from './mute.entity';
import { MuteDto } from './mute.dto';

@Injectable()
export class MuteService {
    constructor(
        @Inject('MUTE_REPOSITORY')
        private readonly muteRepository: typeof Mute,
    ) { }

    /**
     * @brief Find all mutes
     * @return A list of mutes
     * @throws {HttpException} 500 - Internal server error
     */
    async findAll(): Promise<Mute[]> {
        try {
            return await this.muteRepository.findAll<Mute>({ include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * @brief Find a mute by its id
     * @param id The mute's id
     * @return The mute
     * @throws {HttpException} 500 - Internal server error
     */
    async findById(id: number): Promise<Mute> {
        try {
            return await this.muteRepository.findByPk<Mute>( id , { include: [{ all: true }] });
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all mutes of a user
     * @param login The user's login
     * @return A list of mutes
     * @throws {HttpException} 500 - Internal server error
     */
    async findByLogin(login: string): Promise<Mute[]> {
        try {
            return await this.muteRepository.findAll<Mute>({ where: { userLogin: login }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all mutes of a channel
     * @param channelName The channel's name
     * @return A list of mutes
     * @throws {HttpException} 500 - Internal server error
     */
    async findByChannel(channelName: string): Promise<Mute[]> {
        try {
            return await this.muteRepository.findAll<Mute>({ where: { channelName: channelName }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Find all mutes of a user in a channel
     * @param login The user's login
     * @param channelName The channel's name
     * @return A list of mutes
     * @throws {HttpException} 500 - Internal server error
     */
    async findByLoginAndChannel(login: string, channelName: string): Promise<Mute[]> {
        try {
            return await this.muteRepository.findAll<Mute>({ where: { userLogin: login, channelName: channelName }, include: [{ all: true }] });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Create a mute
     * @param mute The mute to create
     * @return The created mute
     * @throws {HttpException} 500 - Internal server error
     */
    async create(mute: MuteDto): Promise<Mute> {
        try {
            let ret = await this.muteRepository.create<Mute>(mute);
            await ret.$set('user', mute.user)
            await ret.$set('channel', mute.channel)
            return ret;
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Delete a mute
     * @param id The mute's id
     * @return The number of deleted rows
     * @throws {HttpException} 500 - Internal server error
     */
    async delete(id: number): Promise<number> {
        try {
            return await this.muteRepository.destroy({ where: { id: id } });
        } 
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
