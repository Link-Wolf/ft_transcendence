import { Module } from '@nestjs/common';
import { ToxicRelationsController } from './toxic-relations.controller';
import { BlockModule } from 'src/block/block.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MembershipModule } from 'src/membership/membership.module';
import { MessageModule } from 'src/message/message.module';

@Module({
	controllers: [ToxicRelationsController],
	imports: [
		BlockModule,
		FriendshipModule,
		UserModule,
		AuthModule,
		MembershipModule,
		MessageModule,
	],
})
export class ToxicRelationsModule {}
