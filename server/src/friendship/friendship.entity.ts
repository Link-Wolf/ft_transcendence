import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';

@Table({ tableName: 'Friendship' })
export class Friendship extends Model<Friendship> {
    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
    })
    friendLoginA: string;

    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
    })
    friendLoginB: string;

    @BelongsTo(() => User, 'friendLoginA')
    friendA: User;

    @BelongsTo(() => User, 'friendLoginB')
    friendB: User;
}