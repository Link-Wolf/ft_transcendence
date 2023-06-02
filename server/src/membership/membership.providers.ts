import { Membership } from "./membership.entity";

export const membershipProviders = [
    {
        provide: 'MEMBERSHIP_REPOSITORY',
        useValue: Membership,
    },
];