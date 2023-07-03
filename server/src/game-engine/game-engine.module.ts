import { Module } from '@nestjs/common';
import { GameEngineGateway } from './game-engine.gateway';
import { GameModule } from 'src/game/game.module';
import { UserModule } from 'src/user/user.module';
import { UserGameModule } from 'src/user-game/user-game.module';

@Module({
	providers: [
		// GameEngineGateway
	],
	exports: [
		// GameEngineGateway
	],
	imports: [GameModule, UserModule, UserGameModule],
})
export class GameEngineModule {}
