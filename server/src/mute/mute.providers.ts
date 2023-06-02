import { Mute } from "./mute.entity";

export const muteProviders = [
    {
        provide: 'MUTE_REPOSITORY',
        useValue: Mute,
    },
];