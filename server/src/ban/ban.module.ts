import { Module } from '@nestjs/common';
import { BanService } from './ban.service';
import { BanController } from './ban.controller';
import { banProviders } from './ban.providers';
import { ChannelModule } from 'src/channel/channel.module';
import { MembershipModule } from 'src/membership/membership.module';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [BanController],
	providers: [BanService, ...banProviders],
	exports: [BanService, ...banProviders],
	imports: [
		UserModule,
		ChannelModule,
		MembershipModule,
	]
})
export class BanModule {}
