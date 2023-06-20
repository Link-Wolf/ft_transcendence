import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { ChannelModule } from './channel/channel.module';
import { GameModule } from './game/game.module';
import { MessageModule } from './message/message.module';
import { ModifierModule } from './modifier/modifier.module';
import { UserGameModule } from './user-game/user-game.module';
import { BlockModule } from './block/block.module';
import { FriendshipModule } from './friendship/friendship.module';
import { MembershipModule } from './membership/membership.module';
import { BanModule } from './ban/ban.module';
import { MuteModule } from './mute/mute.module';
import { PrivateMessageModule } from './private-message/private-message.module';
import { AuthModule } from './auth/auth.module';
import { redisStore } from 'cache-manager-redis-yet';
import { MessageGateway } from './message/message.gateway';
@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		// CacheModule.register({ 
		// 	isGlobal: true,
		// 	store: redisStore, 
		// 	host: 'localhost', //default host
		// 	port: 6379, //default port
		// }),
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
		AuthModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
