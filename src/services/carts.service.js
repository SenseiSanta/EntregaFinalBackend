import { ProductsDAOMongoDB } from '../daos/Products.DAO.js';
import { CartsDaoMongoDB } from '../daos/Carts.DAO.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

let cartsDB = null;
let productsDB = null;

// Persistencia de datos
if (config.server.PERS === 'archive') {
    cartsDB = new Container('carritos')
    productsDB = new Container('productos')
} else if (config.server.PERS === 'mongodb') {
    cartsDB = new CartsDaoMongoDB()
    productsDB = new ProductsDAOMongoDB()
}

export async function getAllCartData() {
    try {
        return await cartsDB.getAll();
    } catch (error) {
        logger.error(error)
        throw new Error ('Ha ocurrido un problema al obtener los carritos')
    }
}

export async function getDataID(id) {
    try {
        let data = await cartsDB.getById(id)
        return data
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al obtener los datos del carrito solicitado con ID ${id}`)
    }
}

export async function addNewCart() {
    try {
        let state = await cartsDB.save('unassigned');
        return state
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al intentar crear el carrito. Intente nuevamente`)
    }
}

export async function updateCart(cart, id) {
    try {
        let process = await cartsDB.updateCart(cart, id);
        return process;
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al intentar actualizar el carrito con su nuevo producto. Intente nuevamente`)
    }
}

export async function deleteCart(cart, product) { 
    try {
        let data = await cartsDB.getById(id)
        return data
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al obtener los datos del carrito solicitado con ID ${id}`)
    }
}

export async function deleteCartByID(id) { 
    try {
        let data = await cartsDB.deleteById(id)
        return data
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al obtener los datos del carrito solicitado con ID ${id}`)
    }
}