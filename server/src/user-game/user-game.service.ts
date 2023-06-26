import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { UserGameDto } from './user-game.dto';
import { UserGame } from './user-game.entity';

@Injectable()
export class UserGameService {
    constructor(
        @Inject('USER_GAME_REPOSITORY')
        private readonly userGameRepository: typeof UserGame
    ) { }

    /**
     * @brief   Find all user games with sequelize
     * @return  {UserGame[]}     List of user games
     * @throws  {HttpException} 500 if an error occured
     */
    async findAll(): Promise<UserGame[]> {
        try {
            return await this.userGameRepository.findAll<UserGame>({ include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find a user game by an user and a game with sequelize
     * @param   {UserGameDto} dto  The user game to find
     * @return  {UserGame}         The user game
     * @throws  {HttpException}    500 if an error occured
     */
    async findByUserAndGame(dto: UserGameDto): Promise<UserGame> {
        try {
            return await this.userGameRepository.findOne<UserGame>(
                { where: {
                    gameId: dto.game.dataValues.id,
                    userLogin: dto.user.dataValues.login
                }, include: [{ all: true }]
            });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find user games by its user login with sequelize
     * @param   {string} login  The user's login
     * @return  {UserGame[]}    List of user games
     * @throws  {HttpException} 500 if an error occured
     */
    async findByUser(login: string): Promise<UserGame[]> {
        try {
            return await this.userGameRepository.findAll<UserGame>({ where: { userLogin: login }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Find user games by its game id with sequelize
     * @param   {number} id  The game's id
     * @return  {UserGame[]}    List of user games
     * @throws  {HttpException} 500 if an error occured
     */
    async findByGame(id: number): Promise<UserGame[]> {
        try {
            return await this.userGameRepository.findAll<UserGame>({ where: { gameId: id }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findNotFinishedByLogin(login: string): Promise<UserGame> {
        try {
            let ret = await this.userGameRepository.findAll<UserGame>({
                where: {
                    userLogin: login,
                },
                include: [{ all: true }]});
            return ret.filter((userGame) => {
                return userGame.game.status !== 'finished';
            })[0];
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Create a user game with sequelize
     * @param   {UserGameDto} userGameDto   The user game to create
     * @return  {UserGame}                  The created user game
     * @throws  {HttpException}             500 if an error occured
     */
    async create(userGameDto: UserGameDto): Promise<UserGame> {
        try {
            let ret = await this.userGameRepository.create<UserGame>(userGameDto);
            await ret.$set('user', userGameDto.user);
            await ret.$set('game', userGameDto.game);
            ret.reload();
            return ret;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Update a user game with sequelize
     * @param   {UserGameDto} userGameDto   The user game to update
     * @return  {number}                    The number of updated rows
     * @throws  {HttpException}             500 if an error occured
     */
    async update(userGameDto: UserGameDto): Promise<number> {
        try {
            return await this.userGameRepository.update<UserGame>(userGameDto, {
                where: {
                    gameId: userGameDto.game.dataValues.id,
                    userLogin: userGameDto.user.dataValues.login
                } 
            })[0];
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief   Delete a user game with sequelize
     * @param   {number} id  The user game's id
     * @return  {number}     The number of deleted rows
     * @throws  {HttpException} 500 if an error occured
     */
    async delete(id: number): Promise<number> {
        try {
            return await this.userGameRepository.destroy({ where: { id: id } });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
