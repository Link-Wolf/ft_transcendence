import {
    Table,
    Column,
    Model,
    DataType,
    HasMany,
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

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isAdmin: boolean;

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