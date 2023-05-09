import {
    Table,
    Column,
    Model,
    DataType,
    HasMany
} from 'sequelize-typescript';
import { UserGame } from 'src/user-game/user-game.entity';
import { Message } from 'src/message/message.entity';
import { Membership } from 'src/membership/membership.entity';
import { Mute } from 'src/mute/mute.entity';
import { Ban } from 'src/ban/ban.entity';
import { Channel } from 'src/channel/channel.entity';

@Table({ tableName: 'User' })
export class User extends Model<User> {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
    })
    login: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name: string;

    @Column({
        type: DataType.BLOB,
    })
    avatar: Buffer;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    has2AF: boolean;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0
    })
    clearance: number;

    @HasMany(() => UserGame)
    userGames: UserGame[];

    @HasMany(() => Message)
    messages: Message[];

    @HasMany(() => Membership)
    memberships: Membership[];

    @HasMany(() => Mute)
    mutes: Mute[];

    @HasMany(() => Ban)
    bans: Ban[];

    @HasMany(() => Channel)
    channelsOwned: Channel[];
}