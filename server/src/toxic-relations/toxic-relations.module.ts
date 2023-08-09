import { Module } from '@nestjs/common';
import { ToxicRelationsController } from './toxic-relations.controller';
import { BlockModule } from 'src/block/block.module';
import { FriendshipModule } from 'src/friendship/friendship.module';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [ToxicRelationsController],
	imports: [BlockModule, FriendshipModule, UserModule],
})
export class ToxicRelationsModule {}
