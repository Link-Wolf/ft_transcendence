import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { MessageDto } from './message.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
    constructor(
        @Inject('MESSAGE_REPOSITORY')
        private readonly messageRepository: typeof Message
    ) { }

    /**
     * @brief   Find all messages with sequelize
     * @return  {Message[]}     List of messages
     * @throws  {HttpException} 500 if an error occured
     */
    async findAll(): Promise<Message[]> {
        try {
            return await this.messageRepository.findAll<Message>({ include: [{ all: true }] });
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find a message by its id with sequelize
     * @param   {number} id     The message's id
     * @return  {Message}       The message
     * @throws  {HttpException} 500 if an error occured
     */
    async findById(id: number): Promise<Message> {
        try {
            return await this.messageRepository
                .findOne<Message>({ where: { id: id }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find messages by a channel name with sequelize
     * @param   {string} chanName   The channel's name
     * @return  {Message[]}         List of messages
     * @throws  {HttpException}     500 if an error occured
     */
    async findByChannel(chanName: string): Promise<Message[]> {
        try {
            return await this.messageRepository
                .findAll<Message>({ where: { channelName: chanName }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find messages by a user login with sequelize
     * @param   {string} userLogin  The user's login
     * @return  {Message[]}         List of messages
     * @throws  {HttpException}     500 if an error occured
     */
    async findByUser(userLogin: string): Promise<Message[]> {
        try {
            return await this.messageRepository
                .findAll<Message>({ where: { userLogin: userLogin }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find messages by a user login and a channel name with sequelize
     * @param   {string} userLogin  The user's login
     * @param   {string} chanName   The channel's name
     * @return  {Message[]}         List of messages
     * @throws  {HttpException}     500 if an error occured
     */
    async findByUserAndChannel(userLogin: string, chanName: string): Promise<Message[]> {
        try {
            return await this.messageRepository
                .findAll<Message>({ where: { userLogin: userLogin, channelName: chanName }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Create a message with sequelize
     * @param   {MessageDto} messageDto   The message's data
     * @return  {Message}                 The created message
     * @throws  {HttpException}           500 if an error occured
     */
    async create(messageDto: MessageDto): Promise<Message> {
        try {
            let ret = await this.messageRepository.create<Message>(messageDto);
            await ret.$set('user', messageDto.user);
            await ret.$set('channel', messageDto.channel);
            return ret;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Delete a message by its id with sequelize
     * @param   {number} id     The message's id
     * @return  {number}        The number of deleted messages
     * @throws  {HttpException} 500 if an error occured
     */
    async delete(id: number): Promise<number> {
        try {
            return await this.messageRepository.destroy<Message>({ where: { id: id } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
