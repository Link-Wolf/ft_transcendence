import { Ban } from "./ban.entity";

export const banProviders = [
    {
        provide: 'BAN_REPOSITORY',
        useValue: Ban,
    },
];