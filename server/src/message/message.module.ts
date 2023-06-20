import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { messageProviders } from './message.providers';
import { MembershipModule } from 'src/membership/membership.module';
import { BanModule } from 'src/ban/ban.module';
import { MuteModule } from 'src/mute/mute.module';
import { UserModule } from 'src/user/user.module';
import { ChannelModule } from 'src/channel/channel.module';
import { MessageGateway } from './message.gateway';

@Module({
	controllers: [
		MessageController
	],
	providers: [
		MessageService, ...messageProviders, MessageGateway
	],
	exports: [
		MessageService, ...messageProviders, MessageGateway
	],
	imports: [
		UserModule,
		ChannelModule, 
		MembershipModule,
		BanModule,
		MuteModule,
	]
})
export class MessageModule { }
