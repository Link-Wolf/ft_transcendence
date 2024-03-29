import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GameDto } from './game.dto';
import { Game } from './game.entity';
import { Op } from 'sequelize';

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
	 * @param   {string} id     The game's id
	 * @return  {Game}          The game
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findById(id: string): Promise<Game> {
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
	 * @brief   Find all games that are ongoing with sequelize
	 * @param   {string} login      The player's login
	 * @return  {Game[]}            List of games
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findOngoing(login: string): Promise<Game[]> {
		try {
			let ret = await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
				where: {
					status: 'ongoing',
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

	/**
	 * @brief   Find games by a player login and weither or not its ranked with sequelize
	 * @param   {string} login      The player's login
	 * @param   {boolean} ranked    Weither or not the game is ranked
	 * @return  {Game[]}            List of games
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findByPlayer(
		login: string,
		isRanked: boolean = false,
	): Promise<Game[]> {
		try {
			let ret = await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
				where: {
					...(isRanked ? { isRanked: isRanked } : {}),
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

	/**
	 * @brief	Find a game that is waiting for more player
	 * @param	{boolean} isRanked	Weither or not the game is ranked
	 * @return	{Game}				The game
	 * @throws	{HttpException}		500 if an error occured
	 */
	async findWaiting(isRanked: boolean = false): Promise<Game> {
		try {
			let ret = await this.gameRepository.findOne<Game>({
				include: [{ all: true }],
				where: {
					status: 'waiting',
					isRanked: isRanked,
				},
			});
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief	Find all games that are playable by a user
	 * @param {string} login	Login of the user
	 * @return {Game[]}		List of games
	 * @throws {HttpException}	500 if an error occured
	 */
	async findPlayable(login: string): Promise<Game[]> {
		try {
			let ret = await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
				where: {
					[Op.or]: [{ status: 'waiting' }, { status: 'invitation' }],
				},
			});
			// ret = ret.filter(
			// 	(game) =>
			// 		// There is a place in the game
			// 		game.dataValues.users.length < 2 &&
			// 		// The game is waiting and he is not already in it
			// 		(game.status === 'waiting' ||
			// 			// The game is an invitation and he is the invitee
			// 			(game.status === 'invitation' &&
			// 				game.invitee === login)),
			// );

			//filter ret to only keep games where the user is in, or where he is invited, or where there is a place AND the game is not an invitation
			ret = ret.filter((game) => {
				return (
					game.users.some((user) => {
						return user.login == login;
					}) ||
					game.invitee === login ||
					(game.users.length < 2 && game.status != 'invitation')
				);
			});
			return ret;
		} catch (err) {
			throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief	Find all games in which a user is invited
	 * @param login The login of the user
	 * @return {Game[]} List of games
	 * @throws {HttpException} 500 if an error occured
	 */
	async findInvitation(login: string): Promise<Game[]> {
		try {
			let ret = await this.gameRepository.findAll<Game>({
				include: [{ all: true }],
				where: {
					status: 'invitation',
					invitee: login,
				},
			});
			return ret;
		} catch (err) {
			throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
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
	 * @param  {string} id     The game's id
	 * @return {number}        The number of deleted games
	 * @throws {HttpException} 500 if an error occured
	 */
	async delete(id: string): Promise<number> {
		try {
			return await this.gameRepository.destroy<Game>({
				where: { id: id },
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
