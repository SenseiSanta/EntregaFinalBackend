/* === Logger === */
import { logger } from '../utils/logger.js';

/*========================================================*/
/*===================== Services  =====================*/
/*========================================================*/

import { ProductsDAOMongoDB } from "../daos/Products.DAO.js"
import { MessagesDAOMongoDB } from '../daos/Messages.DAO.js';
import { UsersDAOMongoDB } from '../daos/Users.DAO.js';
const productsDB = new ProductsDAOMongoDB();
const messagesDB = new MessagesDAOMongoDB();
const usersDB = new UsersDAOMongoDB();

export async function getProductDB() {
    try {
        return await productsDB.getAll();
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    };
};

export async function getUserFromDB() {
    try {
        return await usersDB.getAll();
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    }
};

export async function getMessagesDB() {
    try {
        return await messagesDB.getAll();
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    }
};

export async function saveMessageFromSocket(msg) {
    try {
        return await messagesDB.save(msg);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    }
};

export async function saveProductFromSocket(product) {
    try {
        return await productsDB.save(product);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    }
};