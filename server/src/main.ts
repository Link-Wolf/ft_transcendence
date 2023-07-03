import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
// import * as socketio from 'socket.io';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet(), cookieParser());

	app.enableCors({
		origin: true,
		credentials: true,
	});
	app.setGlobalPrefix('api');

	await app.listen(process.env.REACT_APP_BACKEND_PORT);
}
bootstrap();
