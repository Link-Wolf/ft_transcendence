import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { membershipProviders } from './membership.providers';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService, ...membershipProviders],
  exports: [MembershipService, ...membershipProviders],
  imports: [UserModule, ChannelModule]
})
export class MembershipModule {}
