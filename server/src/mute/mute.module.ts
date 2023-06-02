import { Module } from '@nestjs/common';
import { MuteController } from './mute.controller';
import { muteProviders } from './mute.providers';
import { MuteService } from './mute.service';
import { ChannelService } from 'src/channel/channel.service';
import { MembershipService } from 'src/membership/membership.service';
import { UserService } from 'src/user/user.service';
import { ChannelModule } from 'src/channel/channel.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [MuteController],
	providers: [MuteService, ...muteProviders],
	exports: [MuteService, ...muteProviders],
	imports: [
		UserModule,
		ChannelModule,
		MembershipModule
	]
})
export class MuteModule {}
