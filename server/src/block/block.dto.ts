import { User } from "src/user/user.entity";

export class BlockDto {
    blocker: User;

    blocked: User;
}