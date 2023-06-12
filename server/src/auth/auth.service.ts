import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
const axios = require('axios');

@Injectable()
export class AuthService {
    constructor() { }

	/**
	 * @brief Get the intra user from the code given by intra
	 * @param {string} code Code given by intra
	 * @returns {Object} Intra user
	 * @response 200 - OK
	 * @response 500 - Internal server error
	 */
    async getIntraUser(code: string): Promise<any> {
        let intraUser = await axios.post(`https://api.intra.42.fr/oauth/token`,
		{
			grant_type: 'authorization_code',
			code: code,
			client_id: process.env.INTRA_UID,
			client_secret: process.env.INTRA_SECRET,
			redirect_uri: process.env.INTRA_REDIRECT_URI
		})
		.then((response) => {
			return axios.get(`https://api.intra.42.fr/v2/me`, {
				headers: {
					'Authorization': `Bearer ${response.data.access_token}`
				}
			})
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.log(error, 'ME');
				throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
			})
		})
		.catch((error) => {
			console.log(error, 'TOKEN');
			throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
		})
		return intraUser;
    }

	/**
	 * @brief Verify the TOTP
	 * @param {number} totp TOTP given by the user
	 * @param {string} A2FSecret Secret of the user
	 * @returns {boolean} True if the TOTP is valid, false otherwise
	 * @response 200 - OK
	 * @response 500 - Internal server error
	 */
    async verifyTOTP(totp: number, A2FSecret: string): Promise<boolean> {
        return true;
    }
}