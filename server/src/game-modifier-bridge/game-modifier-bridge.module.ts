import { Module } from '@nestjs/common';
import { GameModifierBridgeService } from './game-modifier-bridge.service';

@Module({
  providers: [GameModifierBridgeService]
})
export class GameModifierBridgeModule {}
