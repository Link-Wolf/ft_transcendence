import { Module } from '@nestjs/common';
import { ModifierController } from './modifier.controller';
import { modifierProviders } from './modifier.providers';
import { ModifierService } from './modifier.service';

@Module({
    controllers: [ModifierController],
    providers: [ModifierService, ...modifierProviders],
    exports: [ModifierService, ...modifierProviders]
})
export class ModifierModule { }
