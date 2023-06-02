import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ModifierDto } from './modifier.dto';
import { Modifier } from './modifier.entity';

@Injectable()
export class ModifierService {
    constructor(
        @Inject('MODIFIER_REPOSITORY')
        private readonly modifierRepository: typeof Modifier
    ) { }

    /**
     * @brief  Find all modifiers with sequelize
     * @return {Modifier[]}    List of modifiers
     * @throws {HttpException} 500 if an error occured
     */
    async findAll(): Promise<Modifier[]> {
        try {
            return await this.modifierRepository.findAll<Modifier>({ include: [{ all: true }] });
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief  Find a modifier by its id with sequelize
     * @param  {number} id     The modifier's id
     * @return {Modifier}      The modifier
     * @throws {HttpException} 500 if an error occured
     */
    async findById(id: number): Promise<Modifier> {
        try {
            return await this.modifierRepository
                .findOne<Modifier>({ where: { id: id }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief  Find a modifier by its name with sequelize
     * @param  {string} name   The modifier's name
     * @return {Modifier}      The modifier
     * @throws {HttpException} 500 if an error occured
     */
    async findByName(name: string): Promise<Modifier> {
        try {
            return await this.modifierRepository
                .findOne<Modifier>({ where: { name: name }, include: [{ all: true }] });
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief  Create a modifier with sequelize
     * @param  {ModifierDto} modifierDto   The modifier to create
     * @return {Modifier}                  The created modifier
     * @throws {HttpException}             500 if an error occured
     */
    async create(modifierDto: ModifierDto): Promise<Modifier> {
        try {
            return await this.modifierRepository.create<Modifier>(modifierDto);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief  Update a modifier with sequelize
     * @param  {ModifierDto} modifierDto   The modifier to update
     * @return {number}                    The number of updated rows
     * @throws {HttpException}             500 if an error occured
     */
    async update(modifierDto: ModifierDto): Promise<number> {
        try {
            return await this.modifierRepository.update<Modifier>(modifierDto, { where: { id: modifierDto.id } })[0];
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @brief  Delete a modifier with sequelize
     * @param  {number} id     The modifier's id
     * @return {number}        The number of deleted rows
     * @throws {HttpException} 500 if an error occured
     */
    async delete(id: number): Promise<number> {
        try {
            return await this.modifierRepository.destroy({ where: { id: id } });
        }
        catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
