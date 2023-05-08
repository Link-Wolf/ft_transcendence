import {
    Table,
    Model,
    BelongsTo,
    ForeignKey,
    Column,
    DataType
} from 'sequelize-typescript';
import { Modifier } from '../modifier/modifier.entity';
import { Game } from '../game/game.entity';

@Table({ tableName: 'gameModifierBridge' })
export class GameModifierBridge extends Model<GameModifierBridge> {
    @ForeignKey(() => Game)
    @Column({
        primaryKey: true,
    })
    gameId: number;

    @ForeignKey(() => Modifier)
    @Column({
        primaryKey: true,
    })
    modifierId: number;

    @BelongsTo(() => Modifier, 'modifierId')
    modifier: Modifier;

    @BelongsTo(() => Game, 'gameId')
    game: Game;
}