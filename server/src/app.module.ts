import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { MessageService } from './message/message.service';
import { ChannelService } from './channel/channel.service';
import { ModifierService } from './modifier/modifier.service';
import { MuteService } from './mute/mute.service';
import { BanService } from './ban/ban.service';
import { GameService } from './game/game.service';
import { GameController } from './game/game.controller';
import { BanController } from './ban/ban.controller';
import { ChannelController } from './channel/channel.controller';
import { MessageController } from './message/message.controller';
import { ModifierController } from './modifier/modifier.controller';
import { MuteController } from './mute/mute.controller';
import { BanModule } from './ban/ban.module';
import { ChannelModule } from './channel/channel.module';
import { GameModule } from './game/game.module';
import { MessageModule } from './message/message.module';
import { ModifierModule } from './modifier/modifier.module';
import { MuteModule } from './mute/mute.module';
import { UserGameModule } from './user-game/user-game.module';
import { BlockService } from './block/block.service';
import { BlockModule } from './block/block.module';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { MembershipModule } from './membership/membership.module';
import { BlockController } from './block/block.controller';
import { blockProviders } from './block/block.providers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    DatabaseModule,
    BanModule,
    ChannelModule,
    GameModule,
    MessageModule,
    ModifierModule,
    MuteModule,
    UserGameModule,
    BlockModule,
    FriendshipModule,
    MembershipModule,
  ],
  controllers: [
    AppController,
    GameController,
    BanController,
    ChannelController,
    MessageController,
    ModifierController,
    MuteController,
    FriendshipController,
    BlockController
  ],
  providers: [
    AppService,
    MessageService,
    ChannelService,
    ModifierService,
    MuteService,
    BanService,
    GameService,
    BlockService,
    FriendshipService,
  ],
})
export class AppModule { }
