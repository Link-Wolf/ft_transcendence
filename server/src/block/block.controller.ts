import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards
} from '@nestjs/common';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Block } from './block.entity';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
    constructor(
        private readonly blockService: BlockService,
        private readonly userService: UserService
    ) { }

    /**
     * @brief Get all blocks
     * @return {Block[]} All blocks
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 500 - Internal Server Error
     */
    @Get()
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async findAll(): Promise<Block[]> {
        return this.blockService.findAll();
    }

    @Get('of/:login')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async findBlockersOf(
        @Param('login') login: string
    ): Promise<Block[]> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return this.blockService.findBlockersOf(login);
    }

    @Get('by/:login')
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)), /*TODO: check if user is the right one*/)
    async findBlocksBy(
        @Param('login') login: string
    ): Promise<Block[]> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return this.blockService.findBlocksBy(login);
    }

    @Get('of/:login/count')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async findCountBlockersOf(
        @Param('login') login: string
    ): Promise<number> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return (await this.blockService.findBlockersOf(login)).length;
    }

    @Get('by/:login/count')
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)), /*TODO: check if user is the right one*/)
    async findCountBlocksBy(
        @Param('login') login: string
    ): Promise<number> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return (await this.blockService.findBlocksBy(login)).length;
    }

    @Get('of/:login/users')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async findUsersBlockersOf(
        @Param('login') login: string
    ): Promise<User[]> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return Array.from(new Set((await this.blockService.findBlocksBy(login)).map(block => block.blocker)));//INFO: do some dark magic to have the list of all user who blocked login without duplicate
    }

    @Get('by/:login/users')
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)), /*TODO: check if user is the right one*/)
    async findUsersBlocksBy(
        @Param('login') login: string
    ): Promise<User[]> {
        if (!await this.userService.findByLogin(login))
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return Array.from(new Set((await this.blockService.findBlocksBy(login)).map(block => block.blocked)));//INFO: do some dark magic to have the list of all user who got blocked login without duplicate
    }

    @Post()
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)), /*TODO: check if blocker is the right one*/)
    async create(
        @Body('blocker') blockerLogin: string,
        @Body('blocked') blockedLogin: string
    ): Promise<Block> {
        if (!blockedLogin || !blockerLogin)
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        let blocker = await this.userService.findByLogin(blockerLogin);
        if (!blocker)
            throw new HttpException('Blocker not found', HttpStatus.NOT_FOUND);
        let blocked = await this.userService.findByLogin(blockedLogin);
        if (!blocked)
            throw new HttpException('Blocked not found', HttpStatus.NOT_FOUND);
        return this.blockService.create({ blocked: blocked, blocker: blocker });
    }
}
