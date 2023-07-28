import { User } from 'src/user/user.entity';

export class BlockDto {
	blocker?: User;

	blocked?: User;

	blockerLogin?: string;

	blockedLogin?: string;
}
