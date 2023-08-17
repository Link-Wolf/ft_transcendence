import {
	Table,
	Column,
	Model,
	DataType,
	HasMany,
	PrimaryKey,
	BelongsToMany,
} from 'sequelize-typescript';
import { UserGame } from 'src/user-game/user-game.entity';
import { Message } from 'src/message/message.entity';
import { Membership } from 'src/membership/membership.entity';
import { Mute } from 'src/mute/mute.entity';
import { Ban } from 'src/ban/ban.entity';
import { Channel } from 'src/channel/channel.entity';
import { Game } from 'src/game/game.entity';
import { Col } from 'sequelize/types/utils';

@Table({ tableName: 'User' })
export class User extends Model<User> {
	@PrimaryKey
	@Column({
		type: DataType.STRING,
	})
	login: string;

	@Column({
		type: DataType.STRING(21),
		allowNull: false,
		unique: true,
	})
	name: string;

	@Column({
		type: DataType.TEXT,
	})
	avatar: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	hasTFA: boolean;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	TFASecret: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	hasConnected: boolean;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	clearance: number;

	@Column({
		type: DataType.ENUM('online', 'offline', 'ongame'),
		defaultValue: 'offline',
	})
	status: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	pongKey: string;

	@Column({
		type: DataType.INTEGER,
		defaultValue: 0,
	})
	pingDelay: number;

	@Column({
		type: DataType.STRING,
		allowNull: true,
		unique: true,
	})
	socketId: string;

	/* RELATIONS */

	@BelongsToMany(() => Game, () => UserGame)
	games: Game[];

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
