import {
    Table,
    Column,
    Model,
    ForeignKey,
    BelongsTo
} from 'sequelize-typescript';
import { User } from 'src/user/user.entity';

@Table({ tableName: 'block' })
export class Block extends Model<Block> {
    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
    })
    blockerLogin: string;

    @ForeignKey(() => User)
    @Column({
        primaryKey: true,
    })
    blockedLogin: string;

    @BelongsTo(() => User, 'blockerLogin')
    blocker: User;

    @BelongsTo(() => User, 'blockedLogin')
    blocked: User;
}