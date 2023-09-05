import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { User } from '../user/user.entity';
import { Channel } from '../channel/channel.entity';
import { Ban } from '../ban/ban.entity';
import { Game } from '../game/game.entity';
import { Message } from '../message/message.entity';
import { Modifier } from '../modifier/modifier.entity';
import { Mute } from '../mute/mute.entity';
import { Friendship } from '../friendship/friendship.entity';
import { UserGame } from '../user-game/user-game.entity';
import { Block } from '../block/block.entity';
import { Membership } from '../membership/membership.entity';
import { SeedingService } from './database.service';

dotenv.config();

export const databaseProviders = [
	{
		provide: 'SEQUELIZE',
		useFactory: async (seedingService: SeedingService) => {
			const sequelize = new Sequelize(
				process.env.DB_NAME,
				process.env.DB_USER,
				process.env.DB_PASS,
				{
					host: process.env.DB_HOST,
					port: parseInt(process.env.DB_PORT),
					dialect: process.env.DB_DIALECT as 'postgres',
					logging: false,
					dialectOptions: {
						application_name: 'ft_transcendence',
					},
				},
			);
			sequelize.addModels([
				User,
				UserGame,
				Game,
				Modifier,
				Ban,
				Mute,
				Channel,
				Block,
				Friendship,
				Message,
				Membership,
			]);
			await sequelize.sync({ alter: true });

			await seedingService.seedModifiers();

			return sequelize;
		},
		inject: [SeedingService],
	},
];
