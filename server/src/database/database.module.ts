import { Module } from '@nestjs/common';
import { databaseProviders } from './database.providers';
import { SeedingService } from './database.service';
import { ModifierModule } from 'src/modifier/modifier.module';

@Module({
	providers: [SeedingService, ...databaseProviders],
	exports: [...databaseProviders],
	imports: [ModifierModule],
})
export class DatabaseModule {}
