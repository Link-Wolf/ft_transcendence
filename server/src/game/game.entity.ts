import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
    BelongsToMany
} from 'sequelize-typescript';
import { UserGame } from 'src/user-game/user-game.entity';
import { Modifier } from 'src/modifier/modifier.entity';
import {
    GameModifierBridge
} from 'src/game-modifier-bridge/game-modifier-bridge.entity';

@Table({ tableName: 'game' })
export class Game extends Model<Game> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false
    })
    isRanked: boolean;

    @HasMany(() => UserGame)
    userGames: UserGame[];

    @BelongsToMany(() => Modifier, () => GameModifierBridge)
    modifiers: Modifier[];
}