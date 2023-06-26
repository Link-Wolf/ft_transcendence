import { HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { Membership } from './membership.entity';
import { MembershipDto } from './membership.dto';

@Injectable()
export class MembershipService {
	constructor(
		@Inject('MEMBERSHIP_REPOSITORY')
		private readonly membershipRepository: typeof Membership,
	) {}

	/**
	 * @brief   Find all memberships with sequelize
	 * @return  {Membership[]}     List of memberships
	 * @throws  {HttpException}    500 if an error occured
	 */
	async findAll(): Promise<Membership[]> {
		try {
			return await this.membershipRepository.findAll<Membership>({
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find memberships by their user login with sequelize
	 * @param   {string} login  The user's login
	 * @return  {Membership[]}  List of memberships
	 * @throws  {HttpException} 500 if an error occured
	 */
	async findByUser(login: string): Promise<Membership[]> {
		try {
			return await this.membershipRepository.findAll<Membership>({
				where: { userLogin: login },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find memberships by their channel name with sequelize
	 * @param   {string} chan_name  The channel's name
	 * @return  {Membership[]}      List of memberships
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findByChannel(chan_name: string): Promise<Membership[]> {
		try {
			return await this.membershipRepository.findAll<Membership>({
				where: { channelName: chan_name },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find a membership by its user login and channel name with sequelize
	 * @param   {string} login      The user's login
	 * @param   {string} chan_name  The channel's name
	 * @return  {Membership}        The membership
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findByUserAndChannel(
		login: string,
		chan_name: string,
	): Promise<Membership> {
		try {
			return await this.membershipRepository.findOne<Membership>({
				where: { userLogin: login, channelName: chan_name },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Find all admins of a channel
	 * @param   {string} chan_name  The channel's name
	 * @return  {Membership[]}      List of memberships
	 * @throws  {HttpException}     500 if an error occured
	 */
	async findAdminsByChannel(chan_name: string): Promise<Membership[]> {
		try {
			return await this.membershipRepository.findAll<Membership>({
				where: { channelName: chan_name, isAdmin: true },
				include: [{ all: true }],
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Create a membership with sequelize
	 * @param   {MembershipDto} membershipDto   The membership to create
	 * @return  {Membership}                    The created membership
	 * @throws  {HttpException}                 500 if an error occured
	 */
	async create(membershipDto: MembershipDto): Promise<Membership> {
		try {
			let ret = await this.membershipRepository.create<Membership>(
				membershipDto,
			);
			await ret.$set('user', membershipDto.user);
			await ret.$set('channel', membershipDto.channel);
			return ret;
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Update a membership with sequelize
	 * @param   {MembershipDto} membershipDto   The membership to update
	 * @return  {number}                        The number of updated memberships
	 * @throws  {HttpException}                 500 if an error occured
	 */
	async update(membershipDto: MembershipDto): Promise<number> {
		try {
			return await this.membershipRepository.update<Membership>(
				membershipDto,
				{
					where: {
						userLogin: membershipDto.user.dataValues.login,
						channelName: membershipDto.channel.dataValues.name,
					},
				},
			)[0];
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * @brief   Delete a membership with sequelize
	 * @param   {string} login      The user's login
	 * @param   {string} chan_name  The channel's name
	 * @return  {number}            The number of deleted memberships
	 * @throws  {HttpException}     500 if an error occured
	 */
	async delete(login: string, chan_name: string): Promise<number> {
		try {
			return await this.membershipRepository.destroy({
				where: {
					userLogin: login,
					channelName: chan_name,
				},
			});
		} catch (error) {
			throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
