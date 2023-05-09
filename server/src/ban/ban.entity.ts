import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';

@Table({ tableName: 'Ban' })
export class Ban extends Model<Ban> {
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
    reason: string;

    @ForeignKey(() => User)
    @Column({})
    userLogin: string;

    @BelongsTo(() => User, 'userLogin')
    user: User;

    @ForeignKey(() => Channel)
    @Column({})
    channelName: string;

    @BelongsTo(() => Channel, 'channelName')
    channel: Channel;
}