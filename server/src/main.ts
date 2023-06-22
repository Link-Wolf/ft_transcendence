import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet(), cookieParser());
	app.useWebSocketAdapter(new IoAdapter(app));
	app.enableCors({
		origin: true,
		credentials: true,
	});
	app.setGlobalPrefix('api');
	var server = await app.listen(process.env.PORT);
	// var io = require('socket.io')(server, {
	// 	cors: {
	// 		origin: '*',
	// 	},
	// });
}
bootstrap();
