import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * This guard is used to check if the user has the clearance needed to access
 * the route.
 */
@Injectable()
export class ClearanceGuard implements CanActivate {
    constructor(private clearanceNeeded: number) { }
    canActivate(_context: ExecutionContext): boolean {
        return true;
        //TODO: implement true guarding through clearance and cookies
    }
}
