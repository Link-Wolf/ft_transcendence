import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { UserGameService } from './user-game.service';
import { UserGame } from './user-game.entity';
import { UserService } from '../user/user.service';
import { GameService } from '../game/game.service';

@Controller('user-game')
export class UserGameController {
    constructor(
        private readonly userGameService: UserGameService,
        private readonly userService: UserService,
        private readonly gameService: GameService
    ) { }

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
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
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
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
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
        let ret = await this.userGameService.findByUserAndGame({ game: game, user: user })
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
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findByUser(@Param('login') login: string): Promise<UserGame[]> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
        let ret = await this.userGameService.findByUser(login);
        if (!ret)
            throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
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
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findByGame(@Param('id', ParseIntPipe) id: number): Promise<UserGame[]> {
        if (!await this.gameService.findById(id))
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
     * @response 201 - Created
     * @response 400 - Bad Request
     * @response 401 - Unauthorized
     * @response 404 - Not Found
     * @response 409 - Conflict
     * @response 500 - Internal Server Error
     */
    @Post()
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async create(
        @Body('userLogin') userLogin: string,
        @Body('gameId', ParseIntPipe) gameId: number,
    ): Promise<UserGame> {
        if (!userLogin)
            throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
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
        if (user_games.find(user_game => user_game.userLogin === userLogin))
            throw new HttpException('User already in game', HttpStatus.CONFLICT);
        return this.userGameService.create({ game: game, user: user, score: 0 });
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
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Param('login') login: string,
        @Body('score', ParseIntPipe) score: number
    ): Promise<Number> {
        if (!login)
            throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
        let user = await this.userService.findByLogin(login);
        if (!user)
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
        let game = await this.gameService.findById(id);
        if (!game)
            throw new HttpException('Game Not Found', HttpStatus.NOT_FOUND);
        if (!await this.userGameService.findByUserAndGame({ game: game, user: user }))
            throw new HttpException('UserGame Not Found', HttpStatus.NOT_FOUND);
        return this.userGameService.update({ game: game, score: score, user: user });
    }
}
