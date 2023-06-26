import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Block } from './block.entity';
import { BlockService } from './block.service';
import { AdminUserGuard } from 'src/guards/admin_user.guard';

@Controller('block')
export class BlockController {
	constructor(
		private readonly blockService: BlockService,
		private readonly userService: UserService,
	) {}

	/**
	 * @brief Get all blocks
	 * @return {Block[]} All blocks
	 * @security Clearance admin
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

	/**
	 * @brief Get all blocks that block login
	 * @param {string} login The login of the user
	 * @return {Block[]} All blocks that block login
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('of/:login')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async findBlockersOf(@Param('login') login: string): Promise<Block[]> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.blockService.findBlockersOf(login);
	}

	/**
	 * @brief Get all blocks that login blocks
	 * @param {string} login The login of the user
	 * @return {Block[]} All blocks that login blocks
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('by/:login')
	@UseGuards(new AdminUserGuard(Number(process.env.USER_CLEARANCE)))
	async findBlocksBy(@Param('login') login: string): Promise<Block[]> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.blockService.findBlocksBy(login);
	}

	/**
	 * @brief Get the number of blocks that block login
	 * @param {string} login The login of the user
	 * @return {number} The number of blocks that block login
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('of/:login/count')
	@UseGuards(new AdminUserGuard(Number(process.env.ADMIN_CLEARANCE)))
	async findCountBlockersOf(@Param('login') login: string): Promise<number> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return (await this.blockService.findBlockersOf(login)).length;
	}

	/**
	 * @brief Get the number of blocks that login blocks
	 * @param {string} login The login of the user
	 * @return {number} The number of blocks that login blocks
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('by/:login/count')
	@UseGuards(new AdminUserGuard(Number(process.env.USER_CLEARANCE)))
	async findCountBlocksBy(@Param('login') login: string): Promise<number> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return (await this.blockService.findBlocksBy(login)).length;
	}

	/**
	 * @brief Get all users who block login
	 * @param {string} login The login of the user
	 * @return {User[]} All users who block login
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('of/:login/users')
	@UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
	async findUsersBlockersOf(@Param('login') login: string): Promise<User[]> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return Array.from(
			new Set(
				(await this.blockService.findBlocksBy(login)).map(
					(block) => block.blocker,
				),
			),
		); //INFO: do some dark magic to have the list of all user who blocked login without duplicate
	}

	/**
	 * @brief Get all users that login blocks
	 * @param {string} login The login of the user
	 * @return {User[]} All users that login blocks
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - User not found
	 * @response 500 - Internal Server Error
	 */
	@Get('by/:login/users')
	@UseGuards(new AdminUserGuard(Number(process.env.USER_CLEARANCE)))
	async findUsersBlocksBy(@Param('login') login: string): Promise<User[]> {
		if (!(await this.userService.findByLogin(login)))
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return Array.from(
			new Set(
				(await this.blockService.findBlocksBy(login)).map(
					(block) => block.blocked,
				),
			),
		); //INFO: do some dark magic to have the list of all user who got blocked login without duplicate
	}

	/**
	 * @brief Create a new block
	 * @param {string} blockerLogin The login of the blocker
	 * @param {string} blockedLogin The login of the blocked
	 * @return {Block} The block created
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 400 - Bad request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(new AdminUserGuard(Number(process.env.USER_CLEARANCE)))
	async create(
		@Body('blocker') blockerLogin: string,
		@Body('blocked') blockedLogin: string,
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
