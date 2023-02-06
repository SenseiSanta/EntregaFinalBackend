/* ======================= Modulos ======================= */
import { MessagesDAOMongoDB } from '../daos/Messages.DAO.js';
import { UsersDAOMongoDB } from '../daos/Users.DAO.js';
import { ProductsDAOMongoDB } from '../daos/Products.DAO.js';
import { CartsDaoMongoDB } from '../daos/Carts.DAO.js';
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';
import { logger } from '../utils/logger.js';

/* ============ Instancia de containers ============ */
let cartsDB = null;
let messagesDB = null;
let productsDB = null;
let usersDB = null;

if (config.server.PERS === 'archive') {
    cartsDB = new Container('carritos');
    productsDB = new Container('productos');
    messagesDB = new Container('mensajes');
    usersDB = new Container('usuarios');
} else if (config.server.PERS === 'mongodb') {
    cartsDB = new CartsDaoMongoDB();
    productsDB = new ProductsDAOMongoDB();
    messagesDB = new MessagesDAOMongoDB();
    usersDB = new UsersDAOMongoDB();
}

/*========================================================*/
/*======================= Services  ======================*/
/*========================================================*/

/*============= Carritos ===========*/
export async function addNewCart(owner) {
    try {
        let state = await cartsDB.save(owner);
        return state
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al intentar crear el carrito. Intente nuevamente`)
    }
}

export async function searchCartByOwner(owner) {
    try {
        let state = await cartsDB.getByOwner(owner);
        return state
    } catch (error) {
        logger.error(error)
        throw new Error (`Ha ocurrido un error al intentar crear el carrito. Intente nuevamente`)
    }
}

/*============= Mensajes ===========*/
export async function getMessages() {
    try {
        return await messagesDB.getAll();
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener los mensajes')
    }
}

export async function searchMessagesByAuthor(author) {
    try {
        return await messagesDB.getByAuthor(author);
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener los mensajes')
    }
}

/*============= Productos ===========*/
export async function getProducts() {
    try {
        return await productsDB.getAll();
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener los productos')
    }
}

export async function getProductByID(id) {
    try {
        return await productsDB.getById(id);
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener los productos')
    }
}

/*============= Usuarios ===========*/
export async function getUsers() {
    try {
        return await usersDB.getAll()
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener los usuarios')
    }
}

export async function getUserById(id) {
    try {
        return await usersDB.getById(id)
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener el usuario especificado')
    }
}

export async function getUserByUsername(user) {
    try {
        return await usersDB.getUserByUsername(user)
    } catch (error) {
        throw new Error ('Ha ocurrido un problema al obtener el usuario especificado')
    }
}

export async function saveInfoUser(userInfo) {
    try {
        return await usersDB.save(userInfo)
    } catch (error) {
        throw new Error (`Ha ocurrido un problema al guardar el usuario ${userInfo.username}`)
    }
}