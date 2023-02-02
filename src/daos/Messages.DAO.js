import { ContainerMongoDB } from "../container/ContainerMongoDB.js"
import MessagesModelMongoDB from "../models/messages.model.js"
import {logger} from '../utils/logger.js';

export class MessagesDAOMongoDB extends ContainerMongoDB {
    constructor() {
        super(MessagesModelMongoDB);
    }

    async updateById(id, obj){
        try {
            await this.conn.connect();
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                let doc = await this.colection.findById(id);
                if (doc != null) {
                    let toUpdate = await this.colection.updateOne({_id: id}, {$set:{
                        author: obj.author,
                        text: obj.text
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
}