import { Controller, Get, UseGuards, Post, Body, HttpException, HttpStatus, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { ClearanceGuard } from '../guards/clearance.guard';
import { AvatarValidationPipe } from './user.pipe';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

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
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
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
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findOne(@Param('login') login: string): Promise<User> {
        if (!login) {
            throw new HttpException(
                'Missing parameters',
                HttpStatus.BAD_REQUEST
            );
        }
        let ret = await this.userService.findOne(login);
        if (!ret) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return ret;
    }

    /**
     * @brief Create a user
     * @param {string} login - The user's login
     * @param {string} name - The user's name
     * @param {boolean} has2AF - The user's 2AF status
     * @param {string} avatar - The user's avatar
     * @return {User} - The created user
     * @security Clearance admin
     * @response 200 - OK
     * @response 400 - Bad Request
     * @response 409 - Conflict
     * @response 500 - Internal Server Error
     */
    @Post()
    @UseGuards(new ClearanceGuard(Number(process.env.ANO_CLEARANCE)))
    async create(
        @Body('login') login: string,
        @Body('name') name: string,
        @Body('has2AF') has2AF?: boolean,
        /* TODO: avatar from blob :) */
    ): Promise<User> {
        if (!login || !name) {
            throw new HttpException(
                'Missing parameters',
                HttpStatus.BAD_REQUEST
            );
        }
        if (await this.userService.findOne(login)) {
            throw new HttpException('User already exists', HttpStatus.CONFLICT);
        }
        return this.userService.create(
            { login: login, name: name, has2AF: has2AF /* avatar: avatar */ }
        );
    }

    /**
     * @brief Delete a user
     * @param {string} login - The user's login
     * @return {number} - The number of deleted users
     * @security Clearance admin
     * @response 200 - OK
     * @response 400 - Bad Request
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
    @Delete(':login')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async delete(@Param('login') login: string): Promise<number> {
        if (!login) {
            throw new HttpException(
                'Missing parameters',
                HttpStatus.BAD_REQUEST
            );
        }
        let user = await this.userService.findOne(login);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return this.userService.delete(login);
    }
}
