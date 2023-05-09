import { Game } from "src/game/game.entity";
import { Modifier } from "src/modifier/modifier.entity";

export class GameModifierBridgeDto {
    game: Game;

    modifier: Modifier;
}