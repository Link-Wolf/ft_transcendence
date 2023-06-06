import { Inject, Injectable } from "@nestjs/common";
const axios = require('axios');

@Injectable()
export class AuthService {
    constructor() { }

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
			})
		})
		.catch((error) => {
			console.log(error, 'TOKEN');
		})
		// console.log(intraUser);
		return intraUser;
    }

    async verifyTOTP(totp: number, A2FSecret: string): Promise<boolean> {
        return true;
    }
}