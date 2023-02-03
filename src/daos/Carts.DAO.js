import { ContainerMongoDB } from '../container/ContainerMongoDB.js'
import CartsModelMongoDB from '../models/carts.model.js'
import { logger } from '../utils/logger.js';

export class CartsDaoMongoDB extends ContainerMongoDB {

    constructor() {
        super(CartsModelMongoDB)
    }

    async save(owner) {
        try {
            await this.conn.connect();
            let doc = await this.colection.create({owner: owner, products: []});
            return doc
        } catch (error) {
            console.log(error)
            return false
        } finally {
            await this.conn.disconnect();
        }
    }

    async updateCart(obj, id) {
        try {
            await this.conn.connect();
            await this.colection.updateOne({"_id": id}, {$set: {"id": id, ...obj}})
            return true
        } catch (error) {
            console.log(error)
            return false
        } finally {
            await this.conn.disconnect();
        }
    }

    async getByOwner(owner) {
        try {
            await this.conn.connect();
            const doc = await this.colection.find({owner: owner});
            if (doc == '') {
                return undefined;
            } else {
                return doc
            }
        }
        catch(error) {
            console.log(error);
        } finally {
            await this.conn.disconnect();
        }
    }
}