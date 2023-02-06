/* ======================= Modulos ======================= */
import { logger } from '../utils/logger.js';
import { ProductsDAOMongoDB } from "../daos/Products.DAO.js"
import { MessagesDAOMongoDB } from '../daos/Messages.DAO.js';
import { UsersDAOMongoDB } from '../daos/Users.DAO.js';
import { CartsDaoMongoDB } from '../daos/Carts.DAO.js';
import { OrdersDAOMongoDB } from '../daos/Orders.DAO.js';
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

/* ============ Instancia de containers ============ */
let productsDB = null;
let messagesDB = null;
let usersDB = null;
let cartsDB = null;
let ordersDB = null;

if (config.server.PERS === 'archive') {
    productsDB = new Container('productos');
    messagesDB = new Container('mensajes');
    usersDB = new Container('usuarios');
    cartsDB = new Container('carritos')
    ordersDB = new Container('ordenes')
} else if (config.server.PERS === 'mongodb') {
    productsDB = new ProductsDAOMongoDB();
    messagesDB = new MessagesDAOMongoDB();
    usersDB = new UsersDAOMongoDB();
    cartsDB = new CartsDaoMongoDB();
    ordersDB = new OrdersDAOMongoDB()
}

/*========================================================*/
/*======================= Services  ======================*/
/*========================================================*/

export async function getProductDB() {
    try {
        return await productsDB.getAll();
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    };
};

export async function getProductByName(product) {
    try {
        return await productsDB.getByProdName(product);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    };
};

export async function getUserFromDB(user) {
    try {
        return await usersDB.getUserByUsername(user);
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
        throw new Error ('Ha ocurrido un error al intentar guardar los datos de la BD');
    }
};

export async function saveProductFromSocket(product) {
    try {
        return await productsDB.save(product);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al intentar guardar los datos de la BD');
    }
};

export async function searchUserCart(user) {
    try {
        return await cartsDB.getByOwner(user);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD');
    }
};

export async function postNewOrder(order, user, userEmail) {
    try {
        return await ordersDB.save(order, user, userEmail);
    } catch (error) {
        logger.error(`Error en servicios de servidor: ${error}`);
        throw new Error ('Ha ocurrido un error al intentar guardar los datos de la BD');
    }
};