import { Module } from '@nestjs/common';
import { PrivateMessageController } from './private-message.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserModule } from 'src/user/user.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	controllers: [PrivateMessageController],
	imports: [
		AuthModule,
		UserModule,
		ChannelModule,
		MembershipModule,
		FriendshipModule,
	],
})
export class PrivateMessageModule {}
