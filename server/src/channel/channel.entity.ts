import {
	Table,
	Column,
	Model,
	DataType,
	HasMany,
	BelongsTo,
	ForeignKey,
	PrimaryKey,
} from 'sequelize-typescript';
import { User } from '../user/user.entity';
import { Message } from '../message/message.entity';
import { Membership } from '../membership/membership.entity';
import { Mute } from '../mute/mute.entity';
import { Ban } from '../ban/ban.entity';

@Table({ tableName: 'Channel' })
export class Channel extends Model<Channel> {
	@PrimaryKey
	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	name: string;

	@ForeignKey(() => User)
	@Column({})
	ownerLogin: string;

	@Column({
		type: DataType.TEXT,
	})
	password?: string;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
	})
	isPrivate: boolean;

	@BelongsTo(() => User, 'ownerLogin')
	owner: User;

	@HasMany(() => Message)
	messages: Message[];

	@HasMany(() => Membership)
	memberships: Membership[];

	@HasMany(() => Mute)
	mutes: Mute[];

	@HasMany(() => Ban)
	bans: Ban[];

	toJSON() {
		const attributes = { ...this.get() };
		if (attributes.password) {
			attributes.password = 'yesyesno';
		}
		return attributes;
	}
}
