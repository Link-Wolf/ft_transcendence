import {
    Table,
    Column,
    Model,
    DataType,
    BelongsTo,
    ForeignKey
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';

@Table({ tableName: 'Mute' })
export class Mute extends Model<Mute> {
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

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    end: Date;

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