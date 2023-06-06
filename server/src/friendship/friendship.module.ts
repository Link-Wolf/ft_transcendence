import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { friendshipProviders } from './friendship.providers';
import { BlockModule } from 'src/block/block.module';
import { FriendshipController } from './friendship.controller';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [BlockModule, UserModule],
	controllers: [FriendshipController],
	providers: [FriendshipService, ...friendshipProviders],
	exports: [FriendshipService, ...friendshipProviders],
})
export class FriendshipModule {}
