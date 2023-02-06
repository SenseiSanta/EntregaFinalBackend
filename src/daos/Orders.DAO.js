import { logger } from "../utils/logger.js";
import { ContainerMongoDB } from "../container/ContainerMongoDB.js"
import OrdersModelMongoDB from "../models/orders.model.js"

export class OrdersDAOMongoDB extends ContainerMongoDB {
    constructor() {
        super(OrdersModelMongoDB);
    }

    async updateById(id, obj){
        try {
            await this.conn.connect();
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                let doc = await this.colection.findById(id);
                if (doc != null) {
                    let toUpdate = await this.colection.updateOne({_id: id}, {$set:{
                        username: obj.username,
                        email: obj.email,
                        order: obj.order,
                        delivered: obj.delivered
                    }});
                    doc = await this.colection.findById(id);
                    return {state: {update: true, data: doc}}
                } else {
                    logger.error(`El id ingresado: ("${id}") -> No coincide con ningun dato existente, revise los parametros de entrada`)
                    return {state: {update: false, data: 'El ID coincide con la BD pero es erroneo o inexistente'}};  
                }
            } else {
                logger.error(`El id ingresado: ("${id}") -> No coincide con ningun dato existente, revise los parametros de entrada`)
                return {state: {update: false, data: 'El ID es erroneo'}}; 
            }
        } catch (error) {
            logger.error(error)
            return {state: {update: false, data: error}}; 
        } finally {
            await this.conn.disconnect();
        }
    }

    async getOrdersByUser(user) {
        try {
            await this.conn.connect();
            const doc = await this.colection.find({username: user});
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

    async save(cart, user, email) {
        try {
            await this.conn.connect();
            let doc = await this.colection.create({
                username: user,
                email: email,
                order: cart.products,
                delivered: false
            });
            return doc
        } catch (error) {
            console.log(error)
            return false
        } finally {
            await this.conn.disconnect();
        }
    }

}