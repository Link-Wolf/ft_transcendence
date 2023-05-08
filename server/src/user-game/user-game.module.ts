import { Module } from '@nestjs/common';
import { UserGameController } from './user-game.controller';
import { UserGameService } from './user-game.service';

@Module({
  controllers: [UserGameController],
  providers: [UserGameService]
})
export class UserGameModule {}
