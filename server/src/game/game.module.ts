import { Module, forwardRef, Inject } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { gameProviders } from './game.providers';
import { UserModule } from 'src/user/user.module';
import { ModifierModule } from 'src/modifier/modifier.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
	controllers: [GameController],
	providers: [GameService, ...gameProviders],
	imports: [UserModule, ModifierModule, AuthModule],
	exports: [GameService, ...gameProviders],
})
export class GameModule {}
