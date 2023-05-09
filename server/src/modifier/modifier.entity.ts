import {
    Table,
    Column,
    Model,
    DataType,
    BelongsToMany,
} from 'sequelize-typescript';
import { Game } from '../game/game.entity';
import {
    GameModifierBridge
} from '../game-modifier-bridge/game-modifier-bridge.entity';

@Table({ tableName: 'Modifier' })
export class Modifier extends Model<Modifier> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    desc: string;

    @Column({
        type: DataType.STRING(42),
        allowNull: false,
    })
    name: string;

    @BelongsToMany(() => Game, () => GameModifierBridge)
    games: Game[];
}