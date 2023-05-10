import { Modifier } from "./modifier.entity";

export const modifierProviders = [
    {
        provide: 'MODIFIER_REPOSITORY',
        useValue: Modifier,
    },
];