import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import * as otplib from 'otplib';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
	constructor(
		@Inject('USER_REPOSITORY')
		private readonly userRepository: typeof User,
	) {}

	/**
	 * @brief   Find all users with sequelize
	 * @return  {User[]}     List of users
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findAll(): Promise<User[]> {
		try {
			return await this.userRepository.findAll<User>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find a user by its login with sequelize
	 * @param   {string} login  The user's login
	 * @return  {User}          The user
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findByLogin(login: string): Promise<User> {
		try {
			return await this.userRepository.findOne<User>({
				where: { login: login },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find a user by its name with sequelize
	 * @param   {string} name   The user's name
	 * @return  {User}          The user
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findByName(name: string): Promise<User> {
		try {
			let ret = await this.userRepository.findOne<User>({
				where: { name: name },
				include: [{ all: true }],
			});
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async generateSecret(login: string): Promise<string> {
		try {
			let secret = otplib.authenticator.generateSecret();
			await this.update({ login, TFASecret: secret });
			return secret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyTFA(login: string, token: string): Promise<boolean> {
		try {
			let secret = (await this.findByLogin(login)).TFASecret;
			return otplib.authenticator.verify({ token, secret });
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async findBySocketId(id: string): Promise<User> {
		try {
			return await this.userRepository.findOne<User>({
				where: { socketId: id },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Create a user with sequelize
	 * @param   {UserDto} userDto   The user to create
	 * @return  {User}              The created user
	 * @throws  {HttpException}     500 if an error occured
	 */
	async create(userDto: UserDto): Promise<User> {
		try {
			return await this.userRepository.create<User>(userDto);
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Update a user by its login with sequelize
	 * @param   {UserDto} userDto   The user to update
	 * @return  {number}            The number of updated rows
	 * @throws  {HttpException}     500 if an error occured
	 */
	async update(userDto: UserDto): Promise<number> {
		try {
			return await this.userRepository.update<User>(userDto, {
				where: { login: userDto.login },
			})[0];
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Update a user's profile picture by its login with sequelize
	 * @param   {UserDto} userDto   The user to update
	 * @return  {number}            The number of updated rows
	 * @throws  {HttpException}     500 if an error occured
	 */
	async updateProfilePicture(userDto: UserDto): Promise<number> {
		try {
			let ret = await this.userRepository.update<User>(userDto, {
				where: { login: userDto.login },
			})[0];
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Delete a user by its login with sequelize
	 * @param   {string} login  The user's login
	 * @return  {number}        The number of deleted rows
	 * @throws  {HttpException} 500 if an error occured
	 */
	async delete(login: string): Promise<number> {
		try {
			return await this.userRepository.destroy({
				where: { login: login },
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async verify(token: string): Promise<User> {
		if (!token) return null;
		const { login, needTFA } = await jwt.verify(token, process.env.JWT_KEY);
		if (needTFA) return null;
		return await this.findByLogin(login);
	}
}
