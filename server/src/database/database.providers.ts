import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';
import { Ban } from 'src/ban/ban.entity';
import { Game } from 'src/game/game.entity';
import { Message } from 'src/message/message.entity';
import { Modifier } from 'src/modifier/modifier.entity';
import { Mute } from 'src/mute/mute.entity';
import { Friendship } from 'src/friendship/friendship.entity';
import { UserGame } from 'src/user-game/user-game.entity';
import {
    GameModifierBridge
} from 'src/game-modifier-bridge/game-modifier-bridge.entity';
import { Block } from 'src/block/block.entity';
import { Membership } from 'src/membership/membership.entity';

dotenv.config();

export const databaseProviders = [{
    provide: 'SEQUELIZE',
    useFactory: async () => {
        const sequelize = new Sequelize(
            process.env.DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASS, {
            dialect: 'postgres',
            logging: false,
            dialectOptions: {
                application_name: 'ft_transcendence',
            },
        });
        sequelize.addModels([
            User,
            UserGame,
            Game,
            GameModifierBridge,
            Modifier,
            Ban,
            Mute,
            Channel,
            Block,
            Friendship,
            Message,
            Membership
        ]);
        await sequelize.sync();
        return sequelize;
    },
}];