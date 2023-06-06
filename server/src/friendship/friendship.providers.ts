import { Friendship } from './friendship.entity';

export const friendshipProviders = [
	{
		provide: 'FRIENDSHIP_REPOSITORY',
		useValue: Friendship,
	},
];