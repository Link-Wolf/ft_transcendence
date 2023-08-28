import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { membershipProviders } from './membership.providers';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	controllers: [MembershipController],
	providers: [MembershipService, ...membershipProviders],
	exports: [MembershipService, ...membershipProviders],
	imports: [UserModule, ChannelModule, AuthModule],
})
export class MembershipModule {}
