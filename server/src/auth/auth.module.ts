import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";

@Module({
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService],
	imports: [UserModule]
})
export class AuthModule {}
