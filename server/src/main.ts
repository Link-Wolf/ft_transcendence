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
			resave: true,
			httpOnly: false,
			saveUninitialized: true,
			maxAge: 42 * 60 * 1000, // 42 minutes
			name: 'xinjingping',
		})
	)
	app.enableCors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
	});
	app.setGlobalPrefix('api');
	await app.listen(process.env.PORT);
}
bootstrap();
