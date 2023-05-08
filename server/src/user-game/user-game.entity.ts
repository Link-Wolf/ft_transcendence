import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';
import { Game } from 'src/game/game.entity';

@Table({ tableName: 'userGame' })
export class UserGame extends Model<UserGame> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    score: number;

    @ForeignKey(() => User)
    @Column({})
    userLogin: string;

    @ForeignKey(() => Game)
    @Column({})
    gameId: number;

    @BelongsTo(() => User, 'userLogin')
    user: User;

    @BelongsTo(() => Game, 'gameId')
    game: Game;
}