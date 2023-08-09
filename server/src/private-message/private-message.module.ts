import { Module } from '@nestjs/common';
import { PrivateMessageController } from './private-message.controller';
import { ChannelModule } from 'src/channel/channel.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserModule } from 'src/user/user.module';
import { FriendshipModule } from 'src/friendship/friendship.module';

@Module({
	controllers: [PrivateMessageController],
	imports: [UserModule, ChannelModule, MembershipModule, FriendshipModule],
})
export class PrivateMessageModule {}
