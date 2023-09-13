import { Column, Model, Table, ForeignKey } from 'sequelize-typescript';
import { Game } from 'src/game/game.entity';
import { Modifier } from 'src/modifier/modifier.entity';

@Table({ tableName: 'GameModifierBridge' })
export class GameModifierBridge extends Model<GameModifierBridge> {
	@ForeignKey(() => Game)
	@Column
	gameId: string;

	@ForeignKey(() => Modifier)
	@Column
	modifierId: number;
}
