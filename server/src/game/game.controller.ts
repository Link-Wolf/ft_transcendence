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
    UseGuards
} from '@nestjs/common';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { ParseBoolPipe } from 'src/user/user.pipe';
import { UserService } from 'src/user/user.service';
import { Game } from './game.entity';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly userService: UserService,
    ) { }


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
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
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
    @Get('id/:id')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async findById(@Param('id', ParseIntPipe) id: number): Promise<Game> {
        let ret = await this.gameService.findById(id);
        if (!ret) {
            throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
        }
        return ret;
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
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findByPlayer(
        @Param('login') login: string,
        @Query('ranked', new DefaultValuePipe(false), ParseBoolPipe) ranked: boolean
    ): Promise<Game[]> {
        if (!login) {
            throw new HttpException(
                'Missing parameters',
                HttpStatus.BAD_REQUEST
            );
        }
        let player = await this.userService.findByLogin(login);
        if (!player) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return await this.gameService.findByPlayer(login, ranked);
    }

    /**
     * @brief Create a game
     * @param {boolean} isRanked - Ranked game
     */
    // @Post()
    // @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    // async create(
    //     @Body('isRanked', new DefaultValuePipe(false), ParseBoolPipe) isRanked: boolean,
    //     @Body('playerA') playerALogin: string,
    //     @Body('playerB') playerBLogin: string,
    //     @Body('modifiers') modifiersString?: string,
    // ): Promise<Game> {
    //     if (!playerALogin || !playerBLogin) {
    //         throw new HttpException(
    //             'Missing parameters',
    //             HttpStatus.BAD_REQUEST
    //         );
    //     }
    //     let playerA = await this.userService.findByLogin(playerALogin);
    //     let playerB = await this.userService.findByLogin(playerBLogin);
    //     if (!playerA || !playerB) {
    //         throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    //     }
    //     if (modifiersString) {
    //         let modList = JSON.parse(modifiersString);
    //         let modifiers = [];
    //         for (let mod of modList) {
    //             let modObj = await this.modifierService.findById(mod);
    //             if (!modObj) {
    //                 throw new HttpException('Modifier not found', HttpStatus.NOT_FOUND);
    //             }
    //             modifiers.push(modObj);
    //         }
    //     }
    //     let userGameA = await this.userGameService.create({ user: playerA, score: 0 });
    //     let userGameB = await this.userGameService.create({ user: playerB, score: 0 });
    //     return await this.gameService.create({
    //         isRanked: isRanked,
    //         userGames: [userGameA, userGameB],
    //         modifiers: modifiers,
    //         status: 'ongoing'
    //     });
    // }
}
