import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
// var session = require('express-session');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(helmet(), cookieParser());
	app.enableCors({
		origin: true,
		credentials: true,
	});
	app.setGlobalPrefix('api');
	await app.listen(process.env.PORT);
}
bootstrap();
