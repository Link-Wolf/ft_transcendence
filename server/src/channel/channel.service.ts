import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Channel } from './channel.entity';
import { ChannelDto } from './channel.dto';

@Injectable()
export class ChannelService {
    constructor(
        @Inject('CHANNEL_REPOSITORY')
        private readonly channelRepository: typeof Channel,
    ) { }

    /**
     * @brief Get all channels
     * @return Promise<Channel[]> All channels
     * @throws {HttpException} 500 - Internal server error
     */
    async findAll(): Promise<Channel[]> {
        try {
            return this.channelRepository.findAll<Channel>({ include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get a channel by its name
     * @param name The channel's name
     * @return Promise<Channel> The channel
     * @throws {HttpException} 500 - Internal server error
     */
    async findByName(name: string): Promise<Channel> {
        try {
            return this.channelRepository.findOne<Channel>({ where: { name: name } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get all public channels
     * @return Promise<Channel[]> All public channels
     * @throws {HttpException} 500 - Internal server error
     */ 
    async findPublic(): Promise<Channel[]> {
        try {
            return this.channelRepository.findAll<Channel>({ where: { isPrivate: false } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get all channels where the login's user is the owner
     * @param login The user's login
     * @return Promise<Channel[]> All channels of the user
     * @throws {HttpException} 500 - Internal server error
     */
    async findByOwner(login: string): Promise<Channel[]> {
        try {
            return this.channelRepository.findAll<Channel>({ where: { owner: login, isPrivate: false } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Get all channels where the password is the same as pass2check
     *        (yeah it's a really bad idea to prevent same password for different 
     *        channels but it's for fun, trust)
     * @param pass2check The channel's password
     * @return Promise<Channel[]> All channels where the password is pass2check
     * @throws {HttpException} 500 - Internal server error
     */
    async findByPassword(pass2check: string): Promise<Channel[]> {
        try {
            return this.channelRepository.findAll<Channel>({ where: { password: pass2check } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Create a channel
     * @param channelDto The channel to create
     * @return Promise<Channel> The created channel
     * @throws {HttpException} 500 - Internal server error
     */    
    async create(channelDto: ChannelDto): Promise<Channel> {
        try {
            return this.channelRepository.create<Channel>(channelDto);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Update a channel
     * @param channelDto The channel to update
     * @return Promise<number> The number of updated rows
     * @throws {HttpException} 500 - Internal server error
     */
    async update(channelDto: ChannelDto): Promise<number> {
        try {
            return this.channelRepository.update<Channel>(channelDto, { where: { name: channelDto.name } })[0];
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief Delete a channel
     * @param name The channel's name
     * @return Promise<number> The number of deleted rows
     * @throws {HttpException} 500 - Internal server error
     */
    async delete(name: string): Promise<number> {
        try {
            return this.channelRepository.destroy({ where: { name: name } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
