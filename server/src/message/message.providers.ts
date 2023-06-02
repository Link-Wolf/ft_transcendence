import { Message } from "./message.entity";

export const messageProviders = [
    {
        provide: 'MESSAGE_REPOSITORY',
        useValue: Message,
    },
];