import { Module, forwardRef, Inject } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { gameProviders } from './game.providers';
import { UserModule } from 'src/user/user.module';
import { UserGameModule } from 'src/user-game/user-game.module';
import { ModifierModule } from 'src/modifier/modifier.module';

@Module({
    controllers: [GameController],
    providers: [GameService, ...gameProviders],
    imports: [
        UserModule,
        ModifierModule
    ],
    exports: [GameService, ...gameProviders]
})
export class GameModule { }