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
    senderLogin: string;

    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
    })
    receiverLogin: string;

    @Column
    isPending: boolean;

    @BelongsTo(() => User, 'senderLogin')
    sender: User;

    @BelongsTo(() => User, 'receiverLogin')
    receiver: User;
}