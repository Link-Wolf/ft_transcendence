import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { messageProviders } from './message.providers';
import { MembershipModule } from 'src/membership/membership.module';
import { BanModule } from 'src/ban/ban.module';
import { MuteModule } from 'src/mute/mute.module';
import { UserModule } from 'src/user/user.module';
import { ChannelModule } from 'src/channel/channel.module';
import { BlockModule } from 'src/block/block.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	controllers: [MessageController],
	providers: [MessageService, ...messageProviders],
	exports: [MessageService, ...messageProviders],
	imports: [
		UserModule,
		ChannelModule,
		MembershipModule,
		BanModule,
		MuteModule,
		BlockModule,
		AuthModule,
	],
})
export class MessageModule {}
