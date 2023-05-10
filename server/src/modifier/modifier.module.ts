import { Module } from '@nestjs/common';
import { modifierProviders } from './modifier.providers';
import { ModifierService } from './modifier.service';

@Module({
    controllers: [ModifierModule],
    providers: [ModifierService, ...modifierProviders],
    exports: [ModifierService, ...modifierProviders]
})
export class ModifierModule { }
