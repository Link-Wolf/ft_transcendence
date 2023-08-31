import {
	Controller,
	Get,
	UseGuards,
	Post,
	Body,
	HttpException,
	HttpStatus,
	Param,
	Patch,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AdminClearanceGuard } from '../guards/admin_clearance.guard';
import { UserClearanceGuard } from '../guards/user_clearance.guard';
import { ParseBoolPipe } from './user.pipe';
import { AdminUserGuard } from 'src/guards/admin_user.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * @brief Get all users
	 * @return {User[]} - All users
	 * @security Clearance admin
	 * @response 200 - OK
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 500 - Internal Server Error
	 */
	@Get()
	@UseGuards(AdminClearanceGuard)
	async findAll(): Promise<User[]> {
		return this.userService.findAll();
	}

	/**
	 * @brief Get a user by its login
	 * @param {string} login - The user's login
	 * @return {User} - The user
	 * @security Clearance user
	 * @response 200 - OK
	 * @response 400 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 404 - Not Found
	 * @response 500 - Internal Server Error
	 */
	@Get(':login')
	@UseGuards(UserClearanceGuard)
	async findOne(@Param('login') login: string): Promise<User> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let ret = await this.userService.findByLogin(login);
		if (!ret) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return ret;
	}

	@Get(':login/status')
	@UseGuards(UserClearanceGuard)
	async getStatus(@Param('login') login: string): Promise<string> {
		if (!login) {
			throw new HttpException(
				'Missing parameters',
				HttpStatus.BAD_REQUEST,
			);
		}
		let ret = await this.userService.findByLogin(login);
		if (!ret) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return ret.status;
	}

	/**
	 * @brief Update a user
	 * @param {string} login - The user's login
	 * @param {string} name - The user's name
	 * @param {boolean} hasTFA - The user's 2AF status
	 * @return {User} - The updated user
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 404 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Patch(':login')
	@UseGuards(AdminUserGuard)
	async update(
		@Param('login') login: string,
		@Body('name') name?: string,
		@Body('hasTFA', ParseBoolPipe) hasTFA?: boolean,
	): Promise<number> {
		let user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		if (name && (await this.userService.findByName(name))) {
			throw new HttpException(
				'Name is already taken',
				HttpStatus.CONFLICT,
			);
		}
		return this.userService.update({
			login: login,
			name: name,
			hasTFA: hasTFA,
		});
	}

	/**
	 * @brief Update a user's profile picture
	 * @param {string} login - The user's login
	 * @param {Buffer} avatar - The user's avatar
	 * @return {User} - The updated user
	 * @security Clearance admin OR user himself
	 * @response 200 - OK
	 * @response 404 - Bad Request
	 * @response 401 - Unauthorized
	 * @response 403 - Forbidden
	 * @response 409 - Conflict
	 * @response 500 - Internal Server Error
	 */
	@Patch('pp/:login')
	@UseGuards(AdminUserGuard)
	@UseInterceptors(FileInterceptor('file'))
	async updateProfilePicture(
		@Param('login') login: string,
		@UploadedFile() avatar: Express.Multer.File,
	): Promise<number> {
		let user = await this.userService.findByLogin(login);
		if (!user) {
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}
		return this.userService.updateProfilePicture({
			login: login,
			avatar: avatar.buffer.toString('base64'),
		});
	}

	// /**
	//  * @brief Delete a user
	//  * @param {string} login - The user's login
	//  * @return {number} - The number of deleted users
	//  * @security Clearance admin
	//  * @response 200 - OK
	//  * @response 400 - Bad Request
	//  * @response 401 - Unauthorized
	//  * @response 403 - Forbidden
	//  * @response 404 - Not Found
	//  * @response 500 - Internal Server Error
	//  */
	// @Delete(':login')
	// @UseGuards(AdminClearanceGuard)
	// async delete(@Param('login') login: string): Promise<number> {
	//     if (!login) {
	//         throw new HttpException(
	//             'Missing parameters',
	//             HttpStatus.BAD_REQUEST
	//         );
	//     }
	//     let user = await this.userService.findByLogin(login);
	//     if (!user) {
	//         throw new HttpException('User not found', HttpStatus.NOT_FOUND);
	//     }
	//     return this.userService.delete(login);
	// }
}
