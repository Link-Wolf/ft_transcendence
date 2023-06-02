import { Channel } from "./channel.entity";

export const channelProviders = [
    {
        provide: 'CHANNEL_REPOSITORY',
        useValue: Channel,
    },
];