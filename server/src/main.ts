import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import session from 'express-session';
async function bootstrap() {
	const { createClient } = require("redis");
	let redisClient = createClient({
		legacyMode: true, socket: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_POST,
		}
	})
	redisClient.on("error", console.error)

	const app = await NestFactory.create(AppModule);

	app.use(
		helmet(),
		session(
			{
				secret: process.env.REDIS_CRYPT_KEY,
				resave: false,
				saveUninitialized: true,
				proxy: true,
				cookie: {
					maxAge: 1000 * 60 * 60 * 42, //42 h
					httpOnly: true,
					sameSite: "lax",
				},
			}
		))
	app.setGlobalPrefix('api');
	await app.listen(3000);
}
bootstrap();
