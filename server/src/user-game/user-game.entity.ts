import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    ForeignKey,
    PrimaryKey
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';
import { Game } from 'src/game/game.entity';

@Table({ tableName: 'UserGame' })
export class UserGame extends Model<UserGame> {
    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    score: number;

    @PrimaryKey
    @ForeignKey(() => User)
    @Column({})
    userLogin: string;

    @BelongsTo(() => User)
    user: User;

    @PrimaryKey
    @ForeignKey(() => Game)
    @Column({})
    gameId: number;

    @BelongsTo(() => Game)
    game: Game;
}