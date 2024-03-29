import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UseGuards,
} from '@nestjs/common';
import { AdminClearanceGuard } from 'src/guards/admin_clearance.guard';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { Block } from './block.entity';
import { BlockService } from './block.service';
import {
	AdminUserGuard,
	AdminUserGuardPost,
} from 'src/guards/admin_user.guard';
import { AdminUserUserGuard } from 'src/guards/admin_user_user.guard';

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
	@UseGuards(AdminClearanceGuard)
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
	@UseGuards(AdminUserGuard)
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
	@UseGuards(AdminUserGuard)
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
	@UseGuards(AdminUserGuard)
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
	@UseGuards(AdminUserGuard)
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
	@UseGuards(AdminClearanceGuard)
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
	@UseGuards(AdminUserGuard)
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
	 * @brief Get block by both blocker and blocked login
	 * @param {string} blockerLogin The login of the blocker
	 * @param {string} blockedLogin The login of the blocked
	 * @security Clearance admin OR blocker OR blocked
	 * @return {Block} The block found (or not)
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Get(':loginA/:loginB')
	@UseGuards(AdminUserUserGuard)
	async findBlockByBothLogin(
		@Param('loginA') blockerLogin: string,
		@Param('loginB') blockedLogin: string,
	): Promise<Block> {
		let blocker = await this.userService.findByLogin(blockerLogin);
		let blocked = await this.userService.findByLogin(blockedLogin);
		if (!blocker || !blocked)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		return this.blockService.findBlockByBothLogin(
			blockerLogin,
			blockedLogin,
		);
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
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Post()
	@UseGuards(AdminUserGuardPost)
	async create(
		@Body('userLogin') blockerLogin: string,
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
		if (blockerLogin === blockedLogin)
			throw new HttpException(
				'You cannot block yourself',
				HttpStatus.CONFLICT,
			);
		const block = await this.blockService.findBlockByBothLogin(
			blockerLogin,
			blockedLogin,
		);
		if (!block)
			return this.blockService.create({
				blocked: blocked,
				blocker: blocker,
				blockedLogin: blockedLogin,
				blockerLogin: blockerLogin,
			});
	}

	/**
	 * @brief Delete a block
	 * @param {string} blockerLogin The login of the blocker
	 * @param {string} blockedLogin The login of the blocked
	 * @return {number} The number of deleted blocks
	 * @security Clearance admin OR blocker
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 404 - Not found
	 * @response 500 - Internal Server Error
	 */
	@Delete(':login/:blocked')
	@UseGuards(AdminUserGuard)
	async delete(
		@Param('login') blockerLogin: string,
		@Param('blocked') blockedLogin: string,
	): Promise<number> {
		let blocker = await this.userService.findByLogin(blockerLogin);
		let blocked = await this.userService.findByLogin(blockedLogin);
		if (!blocker || !blocked)
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		let block = await this.blockService.findBlockByBothLogin(
			blockerLogin,
			blockedLogin,
		);
		if (!block)
			throw new HttpException('Block not found', HttpStatus.NOT_FOUND);
		return this.blockService.delete(block);
	}
}
