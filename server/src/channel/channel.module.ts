import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { channelProviders } from './channel.providers';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [ChannelController],
	providers: [ChannelService, ...channelProviders],
	exports: [ChannelService, ...channelProviders],
	imports: [UserModule]
})
export class ChannelModule {}