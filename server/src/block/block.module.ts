import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';

@Module({
  controllers: [BlockController]
})
export class BlockModule {}
