import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { gameProviders } from './game.providers';
import { UserModule } from 'src/user/user.module';

@Module({
    controllers: [GameController],
    providers: [GameService, ...gameProviders],
    imports: [UserModule],
    exports: [GameService, ...gameProviders]
})
export class GameModule { }