import fs from 'fs/promises';
import { logger } from '../utils/logger.js';

export class Container {
    constructor(archive) {
        this.archive = archive;
    }

    async getAll () {
        try {
            const objs = JSON.parse(await fs.readFile(this.archive, 'utf-8'), null, 2);
            return objs;
        }
        catch(error) {
            logger.error(error)
        }
    }

    async save(obj) {
        try {
            const objs = JSON.parse(await fs.readFile(this.archive, 'utf-8'), null, 2);
            const dateNow = new Date().toLocaleString('es-AR')
            let newId
            if (objs.length == 0) {
                newId = 1
            } else {
                newId = objs[objs.length -1].id + 1
            }

            const newObj = { id: newId, timestamp: dateNow, ...obj}
            objs.push(newObj)

            await fs.writeFile(this.archive, JSON.stringify(objs, null, 2))
            return {
                status: 'Añadido con exito',
                id: newObj.id
            };

        } catch (error) {
            logger.error(error)
        }
    }

    async getById(id) {
        try {
            const objs = JSON.parse(await fs.readFile(this.archive, 'utf-8'), null, 2);
            const indexObj = objs.findIndex((o)=> o.id == id);

            if (indexObj == -1) {
                throw new Error('Objeto no encontrado, intente con otro numero de identificacion')
            } 
            return objs[indexObj];

        } catch (error) {
            logger.error(error)
            return {error: 'Objeto no encontrado'}
        }
    }

    async deleteById(id) {
        try {
            const objs = JSON.parse(await fs.readFile(this.archive, 'utf-8'), null, 2);
            const indexObj = objs.findIndex((o)=> o.id == id);
            
            if (indexObj == -1) {
                throw new Error('Objeto no encontrado, intente con otro numero de identificacion')
            } else {
                objs.splice(indexObj, 1)
            }

            await fs.writeFile(this.archive, JSON.stringify(objs, null, 2))
            return true

        } catch (error) {
            logger.error(error)
            return false
        }
    }

    async updateById(id, product, price, img) {
        try {
            const objs = JSON.parse(await fs.readFile(this.archive, 'utf-8'), null, 2);
            const indexObj = objs.findIndex((o)=> o.id == id);
            
            if (indexObj == -1) {
                throw new Error('Objeto no encontrado, intente con otro numero de identificacion')
            } else {
                objs[indexObj].product = product;
                objs[indexObj].price = price;
                objs[indexObj].img = img;
            }

            await fs.writeFile(this.archive, JSON.stringify(objs, null, 2))
            
            return true

        } catch (error) {
            logger.error(error)
            return false
        }
    }

    async deleteAll() {
        try {
            const objs = await this.getAll();
            
            if (objs == undefined) {
                return 'No hay nada que eliminar'
            } else {
                await fs.writeFile(this.archive, JSON.stringify([], null, 2))
                return 'Archivo reiniciado. Ya no hay elementos en el documento json'
            }
            
        } catch (error) {
            return 'Error: No se pudo eliminar'
        }
    }
}