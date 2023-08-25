import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpStatus,
	HttpException,
	Inject,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { User } from 'src/user/user.entity';

/**
 * This guard is used to check if the user has the clearance needed to access
 * the route.
 */
@Injectable()
export class AdminInvitedUserGuard implements CanActivate {
	constructor(
		private readonly friendshipService: FriendshipService,
		@Inject(AuthService)
		private readonly authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const cookies = context.switchToHttp().getRequest().cookies;
		let user: User;
		const loginA = context.switchToHttp().getRequest().params.loginA;
		const loginB = context.switchToHttp().getRequest().params.loginB;
		let clearance = 0;
		if (cookies.token) {
			let user = await this.authService.verify(cookies.auth);
			if (!user)
				throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
			clearance = user.clearance;
		} else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
		const friendship = await this.friendshipService.findByBothFriends(
			loginA,
			loginB,
		);
		if (clearance < Number(process.env.ADMIN_CLEARANCE))
			throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		else if (friendship.dataValues.receiver == user) return true;
		else throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
		//TODO: test
	}
}
