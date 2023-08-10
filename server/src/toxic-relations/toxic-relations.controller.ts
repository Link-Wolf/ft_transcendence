import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Block } from 'src/block/block.entity';
import { BlockService } from 'src/block/block.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { AdminUserGuardPost } from 'src/guards/admin_user.guard';
import { UserService } from 'src/user/user.service';

@Controller('toxic-relations')
export class ToxicRelationsController {
	constructor(
		private readonly blockService: BlockService,
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	) {}

	@Post()
	@UseGuards(AdminUserGuardPost)
	async blockSoNoFriendForYou(
		@Body('userLogin') blockerLogin: string,
		@Body('blocked') blockedLogin: string,
	): Promise<Block> {
		return undefined;
	}
}
