import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GameDto } from './game.dto';
import { Game } from './game.entity';

@Injectable()
export class GameService {
	constructor(
		@Inject('GAME_REPOSITORY')
		private readonly gameRepository: typeof Game,
	) {}

	/**
	 * @brief   Find all games with sequelize
	 * @return  {Game[]}     List of games
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findAll(): Promise<Game[]> {
		try {
			return await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find a game by its id with sequelize
	 * @param   {number} id     The game's id
	 * @return  {Game}          The game
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findById(id: number): Promise<Game> {
		try {
			return await this.gameRepository.findOne<Game>({
				where: { id: id },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find games by a player login and weither or not its ranked with sequelize
	 * @param   {string} login      The player's login
	 * @param   {boolean} ranked    Weither or not the game is ranked
	 * @return  {Game[]}            List of games
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findByPlayer(
		login: string,
		ranked: boolean = false,
	): Promise<Game[]> {
		try {
			let ret = await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
				where: {
					...(ranked ? { ranked: ranked } : {}),
				},
			});
			return ret.filter((game) => {
				return game.users.some((user) => {
					return user.login == login;
				});
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findWaiting() {
		try {
			let ret = await this.gameRepository.findOne<Game>({
				include: [{ all: true }],
				where: {
					status: 'waiting',
				},
			});
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Create a game with sequelize
	 * @param   {GameDto} gameDto   The game to create
	 * @return  {Game}              The created game
	 * @throws  {HttpException}     500 if an error occured
	 */
	async create(gameDto: GameDto): Promise<Game> {
		try {
			let ret = await this.gameRepository.create<Game>(gameDto);
			await ret.$add('users', gameDto.users);
			ret.dataValues.users = gameDto.users;
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Update a game by its id with sequelize
	 * @param   {GameDto} gameDto   The game to update
	 * @return  {number}              The updated game
	 * @throws  {HttpException}     500 if an error occured
	 */
	async update(gameDto: GameDto): Promise<number> {
		try {
			return await this.gameRepository.update<Game>(gameDto, {
				where: { id: gameDto.id },
			})[0];
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief  Delete a game by its id with sequelize
	 * @param  {number} id     The game's id
	 * @return {number}        The number of deleted games
	 * @throws {HttpException} 500 if an error occured
	 */
	async delete(id: number): Promise<number> {
		try {
			return await this.gameRepository.destroy<Game>({
				where: { id: id },
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
