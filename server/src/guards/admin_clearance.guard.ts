import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';

/**
 * This guard is used to check if the user has the clearance needed to access
 * the route.
 */
@Injectable()
export class AdminClearanceGuard implements CanActivate {
	constructor(
		@Inject(UserService)
		private readonly userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const cookies = context.switchToHttp().getRequest().cookies;
		let clearance = 0;
		if (cookies.token) {
			const jwt_data = jwt.verify(cookies['token'], process.env.JWT_KEY);

			const user = await this.userService.findByLogin(jwt_data.login);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		if (clearance < Number(process.env.ADMIN_CLEARANCE))
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		return true;
		//TODO: test
	}
}
