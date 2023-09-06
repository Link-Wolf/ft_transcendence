import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';


@Table({ tableName: 'Message' })
export class Message extends Model<Message> {
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
    content: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    date: Date;

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