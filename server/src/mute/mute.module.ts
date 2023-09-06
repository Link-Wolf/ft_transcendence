import { Module } from '@nestjs/common';
import { MuteController } from './mute.controller';
import { muteProviders } from './mute.providers';
import { MuteService } from './mute.service';
import { ChannelModule } from 'src/channel/channel.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	controllers: [MuteController],
	providers: [MuteService, ...muteProviders],
	exports: [MuteService, ...muteProviders],
	imports: [UserModule, ChannelModule, MembershipModule, AuthModule],
})
export class MuteModule {}
