import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { MessageService } from './message/message.service';
import { ChannelService } from './channel/channel.service';
import { ModifierService } from './modifier/modifier.service';
import { GameService } from './game/game.service';
import { GameController } from './game/game.controller';
import { ChannelController } from './channel/channel.controller';
import { MessageController } from './message/message.controller';
import { ModifierController } from './modifier/modifier.controller';
import { ChannelModule } from './channel/channel.module';
import { GameModule } from './game/game.module';
import { MessageModule } from './message/message.module';
import { ModifierModule } from './modifier/modifier.module';
import { UserGameModule } from './user-game/user-game.module';
import { BlockService } from './block/block.service';
import { BlockModule } from './block/block.module';
import { FriendshipService } from './friendship/friendship.service';
import { FriendshipController } from './friendship/friendship.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { MembershipModule } from './membership/membership.module';
import { BlockController } from './block/block.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    DatabaseModule,
    ChannelModule,
    GameModule,
    MessageModule,
    ModifierModule,
    UserGameModule,
    BlockModule,
    FriendshipModule,
    MembershipModule,
  ],
  controllers: [
    AppController,
    GameController,
    ChannelController,
    MessageController,
    ModifierController,
    FriendshipController,
    BlockController
  ],
  providers: [
    AppService,
    MessageService,
    ChannelService,
    ModifierService,
    GameService,
    BlockService,
    FriendshipService,
  ],
})
export class AppModule { }
