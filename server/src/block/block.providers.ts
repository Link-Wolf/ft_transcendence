import { Block } from "./block.entity";

export const blockProviders = [
    {
        provide: 'BLOCK_REPOSITORY',
        useValue: Block,
    },
];