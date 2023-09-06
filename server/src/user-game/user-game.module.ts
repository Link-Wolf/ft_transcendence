import { Module } from '@nestjs/common';
import { UserGameController } from './user-game.controller';
import { userGameProviders } from './user-game.providers';
import { UserGameService } from './user-game.service';
import { UserModule } from '../user/user.module';
import { GameModule } from '../game/game.module';

@Module({
  imports: [
    UserModule,
    GameModule
  ],
  controllers: [UserGameController],
  providers: [UserGameService, ...userGameProviders],
  exports: [UserGameService, ...userGameProviders]
})
export class UserGameModule { }
