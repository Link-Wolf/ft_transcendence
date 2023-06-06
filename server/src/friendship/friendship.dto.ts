import { User } from "src/user/user.entity";

export class FriendshipDto {
    isPending?: boolean;

    receiver?: User;

    sender?: User;
}