import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
// var session = require('express-session');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet(), cookieParser(process.env.COOKIE_SECRET));
	app.enableCors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	});
	app.setGlobalPrefix('api');
	await app.listen(process.env.PORT);
}
bootstrap();
