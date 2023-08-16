import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { UserGameService } from './user-game.service';
import { UserGame } from './user-game.entity';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';
import { AdminUserGuardPost } from 'src/guards/admin_user.guard';

@Controller('user-game')
export class UserGameController {
	constructor(
		private readonly userGameService: UserGameService,
		private readonly userService: UserService,
		private readonly gameService: GameService,
	) {}

	/**
	 * @brief Get all user games
	 * @returns {UserGame[]} All user games
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async findAll(): Promise<UserGame[]> {
		return this.userGameService.findAll();
	}

	/**
	 * @brief Get a user game by user login and game id
	 * @param {number} id - User game id
	 * @param {string} login - User login
	 * @returns {UserGame} User game by user login and game id
	 * @security Clearance admin OR user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('game/:id/player/:login')
	@UseGuards(AdminClearanceGuard)
	async getByUserAndGame(
		@Param('id', ParseIntPipe) id: number,
		@Param('login') login: string,
	): Promise<UserGame> {
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
		let game = await this.gameService.findById(id);
		if (!game)
			throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
		let ret = await this.userGameService.findByUserAndGame({
			game: game,
			user: user,
		});
		if (!ret)
			throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
		return ret;
	}

	/**
	 * @brief Get all user games by user login
	 * @param {string} login - User login
	 * @returns {UserGame[]} All user games by user login
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('user/:login')
	@UseGuards(UserClearanceGuard)
	async findByUser(@Param('login') login: string): Promise<any[]> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
		let ret = (await this.userGameService.findByUser(login)) as any[];
		if (!ret)
			throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
		for (let i = 0; i < ret.length; i++) {
			ret[i].dataValues.game = await this.gameService.findById(
				ret[i].gameId,
			);
			if (ret[i].dataValues.game.status !== 'waiting')
				ret[i].dataValues.opponentUserGame =
					await this.userGameService.findByUserAndGame({
						game: ret[i].dataValues.game,
						user: ret[i].dataValues.game.users.find(
							(element: any) => {
								return element.dataValues.login !== login;
							},
						),
					});
		}
		return ret;
	}

	/**
	 * @brief Get all user's game results by user login
	 * @param {string} login - User login
	 * @returns  {{wins: number, losses: number}} All user's game results by user login
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('results/:login')
	@UseGuards(UserClearanceGuard)
	async findResultsByUser(
		@Param('login') login: string,
	): Promise<{ wins: number; losses: number }> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
		let games = await this.userGameService.findByUser(login);
		let ret = { wins: 0, losses: 0 };
		games.forEach((element) => {
			if (element.score === 11) ret.wins++;
			else ret.losses++;
		});
		return ret;
	}

	/**
	 * @brief Get all user games by game id
	 * @param {number} id - Game id
	 * @returns {UserGame[]} All user games by game id
	 * @security Clearance admin OR one of the 2 players of the game
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('game/:id')
	@UseGuards(UserClearanceGuard)
	async findByGame(
		@Param('id', ParseIntPipe) id: number,
	): Promise<UserGame[]> {
		if (!(await this.gameService.findById(id)))
			throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
		let ret = await this.userGameService.findByGame(id);
		if (!ret)
			throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
		return ret;
	}

	/**
	 * @brief Create a new user game
	 * @param {string} userLogin - User login
	 * @param {number} gameId - Game id
	 * @returns {UserGame} New user game
	 * @security Admin clearance OR user himself
	 * @response 201 - Created
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminUserGuardPost)
	async create(
		@Body('userLogin') userLogin: string,
		@Body('gameId', ParseIntPipe) gameId: number,
	): Promise<UserGame> {
		if (!userLogin)
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		let user = await this.userService.findByLogin(userLogin);
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
		let game = await this.gameService.findById(gameId);
		if (!game)
			throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);

		//check that the game is not already link to 2 user-game
		let user_games = await this.userGameService.findByGame(gameId);
		if (user_games.length >= 2)
			throw new HttpException('Game is full', HttpStatus.CONFLICT);

		//check that the user is not already in this game
		if (user_games.find((user_game) => user_game.userLogin === userLogin))
			throw new HttpException(
				'User already in game',
				HttpStatus.CONFLICT,
			);
		return this.userGameService.create({
			game: game,
			user: user,
			score: 0,
		});
	}

	/**
	 * @brief Update a user game
	 * @param {number} id - User game id
	 * @param {string} login - User login
	 * @param {number} id - Game id
	 * @param {number} score - User score
	 * @returns {number} Number of updated user games
	 * @security Clearance admin OR one of the 2 players of the game
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Patch('game/:id/player/:login')
	@UseGuards(AdminClearanceGuard)
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Param('login') login: string,
		@Body('score', ParseIntPipe) score: number,
	): Promise<Number> {
		if (!login)
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		let user = await this.userService.findByLogin(login);
		if (!user)
			throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
		let game = await this.gameService.findById(id);
		if (!game)
			throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
		if (
			!(await this.userGameService.findByUserAndGame({
				game: game,
				user: user,
			}))
		)
			throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
		return this.userGameService.update({
			game: game,
			score: score,
			user: user,
		});
	}
}
