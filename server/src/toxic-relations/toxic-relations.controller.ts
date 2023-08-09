import { Controller } from '@nestjs/common';
import { BlockService } from 'src/block/block.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { UserService } from 'src/user/user.service';

@Controller('toxic-relations')
export class ToxicRelationsController {
	constructor(
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	) {}

	@Post
@UseGuards(AdminUserGuardPost)
async blockSoNoFriendForYou(
	@Body('userLogin') blockerLogin: string,
	@Body('blocked') blockedLogin: string,): Promise<Block> {}
}
