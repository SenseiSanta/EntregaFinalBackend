import mongoose from 'mongoose';
import MongoDBClient from '../classes/MongoDBClient.class.js';
import {logger} from '../utils/logger.js';

await mongoose.set('strictQuery', false)

export class ContainerMongoDB {
    constructor(modelo) {
        this.colection = modelo;
        this.conn = MongoDBClient.getInstance();
    }

    async getAll() {
        try {
            await this.conn.connect();
            const docs = await this.colection.find();
            return docs;
        } catch(error) {
            logger.error(error);
            return undefined
        } finally {
            await this.conn.disconnect();
        }
    }

    async save(obj) {
        try {
            await this.conn.connect();
            let doc = await this.colection.create(obj);
            return {status: 'Objeto agregado', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha guardado. Intenta con otro nombre'}
        } finally {
            await this.conn.disconnect();
        }
    }

    async getById(id) {
        try {
            await this.conn.connect();
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const doc = await this.colection.findById(id);
                return doc
            } else {
                logger.error(`El id ingresado: ("${id}") -> No coincide con ningun dato existente, revise los parametros de entrada`)
                return undefined;
            }
        }
        catch(error) {
            console.log(error);
        } finally {
            await this.conn.disconnect();
        }
    }

    async deleteById(id) {
        try {
            await this.conn.connect();
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                let doc = await this.colection.findById(id);
                if (doc !== null) {
                    let toDelete = await this.colection.deleteOne({_id: id});
                    return {state: {delete: true, data: doc}}
                } else {
                    return {state: {delete: false, data: 'El ID coincide con la BD pero es erroneo o inexistente'}}
                }
            } else {
                return {state: {delete: false, data: 'El ID es erroneo'}}; 
            }
        } catch (error) {
            console.log(error)
            return {state: {delete: false, data: error}}; 
        } finally {
            await this.conn.disconnect();
        }
    }

    async updateById(user, pass){
        try {
            await this.conn.connect();
            let doc = await this.colection.updateOne({username: user}, {password: pass});
            return {status: 'Objeto actualizado con exito', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'El objeto no se ha actualizado'}
        } finally {
            await this.conn.disconnect();
        }
    }

    async deleteAll() {
        try {
            await this.conn.connect();
            let doc = await this.colection.deleteMany({});
            return {status: 'Todo ha sido eliminado', doc: doc}
        } catch (error) {
            console.log(error)
            return {error: 'No se ha eliminado nada'}
        } finally {
            await this.conn.disconnect();
        }
    }
}