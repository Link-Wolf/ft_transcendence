import {
	Table,
	Column,
	Model,
	DataType,
	BelongsToMany,
} from 'sequelize-typescript';
import { Game } from '../game/game.entity';
import { GameModifierBridge } from 'src/game-modifier-bridge/game-modifier-bridge.entity';

@Table({ tableName: 'Modifier' })
export class Modifier extends Model<Modifier> {
	@Column({
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	})
	id: number;

	@Column({
		type: DataType.STRING(42),
		allowNull: false,
		unique: true,
	})
	code: string;

	@Column({
		type: DataType.TEXT,
		allowNull: false,
	})
	desc: string;

	@Column({
		type: DataType.STRING(42),
		allowNull: false,
		unique: true,
	})
	name: string;

	@BelongsToMany(() => Game, () => GameModifierBridge)
	games: Game[];
}
