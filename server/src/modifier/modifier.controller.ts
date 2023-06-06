import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ClearanceGuard } from 'src/guards/clearance.guard';
import { Modifier } from './modifier.entity';
import { ModifierService } from './modifier.service';

@Controller('modifier')
export class ModifierController {
    constructor(
        private readonly modifierService: ModifierService
    ) { }

    /**
     * @brief Get all modifiers
     * @return {Modifier[]} - All modifiers
     * @security Clearance user
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 500 - Internal Server Error
     */
    @Get()
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findAll(): Promise<Modifier[]> {
        return this.modifierService.findAll();
    }

    /**
     * @brief Get a modifier by its id
     * @param {number} id - The modifier's id
     * @return {Modifier} - The modifier
     * @security Clearance user
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
    @Get(':id')
    @UseGuards(new ClearanceGuard(Number(process.env.USER_CLEARANCE)))
    async findById(@Param('id', ParseIntPipe) id: number): Promise<Modifier> {
        let modifier = await this.modifierService.findById(id);
        if (!modifier) {
            throw new HttpException('Modifier not found', HttpStatus.NOT_FOUND);
        }
        return modifier;
    }

    /**
     * @brief Create a modifier
     * @param {string} name - The modifier's name
     * @param {string} desc - The modifier's description
     * @return {Modifier} - The created modifier
     * @security Clearance admin
     * @response 201 - Created
     * @response 400 - Bad Request
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 409 - Conflict
     * @response 500 - Internal Server Error
     */
    @Post()
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async create(
        @Body('name') name: string,
        @Body('desc') desc: string,
    ): Promise<Modifier> {
        if (!name || !desc) {
            throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
        }
        if (await this.modifierService.findByName(name)) {
            throw new HttpException('Name is already taken', HttpStatus.CONFLICT);
        }
        return this.modifierService.create({ name: name, desc: desc });
    }

    /**
     * @brief Update a modifier
     * @param {number} id - The modifier's id
     * @param {string} name - The modifier's name
     * @param {string} desc - The modifier's description
     * @return {Modifier} - The updated modifier
     * @security Clearance admin
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 409 - Conflict
     * @response 500 - Internal Server Error
     */
    @Patch(':id')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body('name') name?: string,
        @Body('desc') desc?: string,
    ): Promise<number> {
        let modifier = await this.modifierService.findById(id);
        if (!modifier) {
            throw new HttpException('Modifier not found', HttpStatus.NOT_FOUND);
        }
        if (name && await this.modifierService.findByName(name)) {
            throw new HttpException('Name is already taken', HttpStatus.CONFLICT);
        }
        return this.modifierService.update({ id: id, name: name, desc: desc });
    }

    /**
     * @brief Delete a modifier
     * @param {number} id - The modifier's id
     * @return {number} - The number of deleted modifiers
     * @security Clearance admin
     * @response 200 - OK
     * @response 401 - Unauthorized
     * @response 403 - Forbidden
     * @response 404 - Not Found
     * @response 500 - Internal Server Error
     */
    @Delete(':id')
    @UseGuards(new ClearanceGuard(Number(process.env.ADMIN_CLEARANCE)))
    async delete(@Param('id', ParseIntPipe) id: number): Promise<number> {
        let modifier = await this.modifierService.findById(id);
        if (!modifier) {
            throw new HttpException('Modifier not found', HttpStatus.NOT_FOUND);
        }
        return this.modifierService.delete(id);
    }
}
