import {
	Body,
	Controller,
	DefaultValuePipe,
	Get,
	HttpException,
	HttpStatus,
	Param,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { UserClearanceGuard } from 'src/guards/user_clearance.guard';
import { ParseBoolPipe } from 'src/user/user.pipe';
import { UserService } from 'src/user/user.service';
import { Game } from './game.entity';
import { GameService } from './game.service';
import { ModifierService } from 'src/modifier/modifier.service';
import { AdminUserUserGuardPost } from 'src/guards/admin_user_user.guard';

@Controller('game')
export class GameController {
	constructor(
		private readonly gameService: GameService,
		private readonly userService: UserService,
		private readonly modifierService: ModifierService,
	) {}

	/**
	 * @brief Get all games
	 * @return {Game[]} All games
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async findAll(): Promise<Game[]> {
		return await this.gameService.findAll();
	}

	/**
	 * @brief Get a game by id
	 * @param {number} id - Game id
	 * @return {Game} Game
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':id')
	@UseGuards(AdminClearanceGuard)
	async findById(@Param('id') id: string): Promise<Game> {
		let ret = await this.gameService.findById(id);
		if (!ret) {
			throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
		}
		return ret;
	}

	/**
	 *
	 * @param login TODO:
	 */
	@Get('invitation/:login')
	@UseGuards(UserClearanceGuard)
	async findInvitation(@Param('login') login: string): Promise<Game[]> {
		throw new HttpException('Not implemented', HttpStatus.NOT_IMPLEMENTED);
	}

	/**
	 * @brief Get games by player
	 * @param {string} login - Player login
	 * @param {boolean} ranked - Ranked games only
	 * @return {Game[]} Games
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('player/:login')
	@UseGuards(UserClearanceGuard)
	async findByPlayer(
		@Param('login') login: string,
		@Query('ranked', new DefaultValuePipe(false), ParseBoolPipe)
		ranked: boolean,
	): Promise<Game[]> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let player = await this.userService.findByLogin(login);
		if (!player) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return await this.gameService.findByPlayer(login, ranked);
	}

	/**
	 * @brief Get all games by player, ranked or not
	 * @param {string} login - Player login
	 * @return {Game[]} Games
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get('all/player/:login')
	@UseGuards(UserClearanceGuard)
	async findAllByPlayer(@Param('login') login: string): Promise<Game[]> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let player = await this.userService.findByLogin(login);
		if (!player) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		let ret = await this.gameService.findByPlayer(login, true);
		ret = ret.concat(await this.gameService.findByPlayer(login, false));
		return ret;
	}

	/**
	 * @brief Create a game
	 * @param {boolean} isRanked - Ranked game
	 * @param {string} playerALogin - Player A login
	 * @param {string} playerBLogin - Player B login
	 * @param {string} modifiersString - Modifiers ids
	 * @return {Game} Game
	 * @security Admin clearance OR user with loginA OR user with loginB
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminUserUserGuardPost)
	async create(
		@Body('isRanked', new DefaultValuePipe(false), ParseBoolPipe)
		isRanked: boolean,
		@Body('loginA') playerALogin: string,
		@Body('loginB') playerBLogin: string,
		@Body('modifiers') modifiersString?: string,
	): Promise<Game> {
		if (!playerALogin || !playerBLogin) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let playerA = await this.userService.findByLogin(playerALogin);
		let playerB = await this.userService.findByLogin(playerBLogin);
		if (!playerA || !playerB) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		let modifiers = [];
		if (modifiersString) {
			let modList = JSON.parse(modifiersString);
			for (let mod of modList) {
				let modObj = await this.modifierService.findById(mod);
				if (!modObj) {
					throw new HttpException(
						'Modifier not found',
						HttpStatus.NOT_FOUND,
					);
				}
				modifiers.push(modObj);
			}
		}
		return this.gameService.create({
			isRanked: isRanked,
			users: [playerA, playerB],
			modifiers: modifiers,
			status: 'ongoing',
		});
	}
}
