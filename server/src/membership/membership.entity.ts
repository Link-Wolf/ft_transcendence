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


@Table({ tableName: 'Membership' })
export class Membership extends Model<Membership> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true
    })
    id: number;

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

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isAdmin: boolean;
}