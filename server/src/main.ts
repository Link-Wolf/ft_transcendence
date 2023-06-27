import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as socketio from 'socket.io';
import { Logger } from '@nestjs/common';

class SocketIoAdapter extends IoAdapter {
	createIOServer(
		port: number,
		options?: socketio.ServerOptions,
	): socketio.Server {
		const server = super.createIOServer(port, options);
		// Add any custom configuration or event handling here
		return server;
	}
}

async function bootstrap() {
	const logger: Logger = new Logger('MessageGateway');
	const app = await NestFactory.create(AppModule);

	app.use(helmet(), cookieParser());
	app.useWebSocketAdapter(new SocketIoAdapter(app));

	const server = app.getHttpServer();
	const io = new socketio.Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	})

	app.enableCors({
		origin: true,
		credentials: true,
	});
	app.setGlobalPrefix('api');
	await app.listen(process.env.REACT_APP_BACKEND_PORT);
	io.on('connection', (socket) => {
		logger.log(`Client disconnected: ${socket.id}`);
		socket.on('disconnect', () => {
		logger.log(`Client connected: ${socket.id}`);
		});
	})
}
bootstrap();
