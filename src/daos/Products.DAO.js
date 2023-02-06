import { logger } from "../utils/logger.js";
import { ContainerMongoDB } from "../container/ContainerMongoDB.js"
import ProductsModelMongoDB from "../models/products.model.js"

export class ProductsDAOMongoDB extends ContainerMongoDB {
    constructor() {
        super(ProductsModelMongoDB);
    }

    async updateById(id, obj){
        try {
            await this.conn.connect();
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                let doc = await this.colection.findById(id);
                if (doc != null) {
                    let toUpdate = await this.colection.updateOne({_id: id}, {$set:{
                        product: obj.product,
                        price: obj.price,
                        img: obj.img,
                        code: obj.code,
                        category: obj.category,
                        description: obj.description,
                        stock: obj.stock
                    }});
                    doc = await this.colection.findById(id);
                    return {state: {update: true, newData: doc}}
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

    async getByProdName(product) {
        try {
            await this.conn.connect();
            const doc = await this.colection.find({product: product});
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