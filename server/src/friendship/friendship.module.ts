import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { friendshipProviders } from './friendship.providers';
import { BlockModule } from 'src/block/block.module';
import { FriendshipController } from './friendship.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	imports: [BlockModule, UserModule, AuthModule],
	controllers: [FriendshipController],
	providers: [FriendshipService, ...friendshipProviders],
	exports: [FriendshipService, ...friendshipProviders],
})
export class FriendshipModule {}
