import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
var session = require('express-session');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(
		helmet(),
		session({
			secret: process.env.SESSION_SECRET,
			resave: false,
			httpOnly: false,
			saveUninitialized: false,
			maxAge: 42 * 60 * 1000, // 42 minutes
			name: 'xinjingping',
		})
	)
	app.setGlobalPrefix('api');
	await app.listen(process.env.PORT);
}
bootstrap();
