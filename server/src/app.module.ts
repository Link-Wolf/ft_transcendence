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
import { MembershipController } from './membership/membership.controller';
import { MembershipService } from './membership/membership.service';
import { BanModule } from './ban/ban.module';
import { BanController } from './ban/ban.controller';
import { BanService } from './ban/ban.service';
import { MuteModule } from './mute/mute.module';
import { MuteController } from './mute/mute.controller';
import { MuteService } from './mute/mute.service';
import { PrivateMessageModule } from './private-message/private-message.module';

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
    BanModule,
    MuteModule,
    PrivateMessageModule,
  ],
  controllers: [
    AppController,
    GameController,
    ChannelController,
    MessageController,
    ModifierController,
    FriendshipController,
    BlockController,
    MembershipController,
    BanController,
    MuteController,
  ],
  providers: [
    AppService,
    MessageService,
    ChannelService,
    ModifierService,
    GameService,
    BlockService,
    FriendshipService,
    MembershipService,
    BanService,
    MuteService
  ],
})
export class AppModule { }
