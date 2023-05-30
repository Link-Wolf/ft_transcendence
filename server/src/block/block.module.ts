import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { blockProviders } from './block.providers';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [BlockController],
  providers: [
    BlockService,
    ...blockProviders
  ],
  exports: [
    BlockService,
    ...blockProviders
  ],
})
export class BlockModule { }
