import { Module } from '@nestjs/common';
import { ModifierController } from './modifier.controller';
import { modifierProviders } from './modifier.providers';
import { ModifierService } from './modifier.service';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [UserModule],
	controllers: [ModifierController],
	providers: [ModifierService, ...modifierProviders],
	exports: [ModifierService, ...modifierProviders],
})
export class ModifierModule {}
