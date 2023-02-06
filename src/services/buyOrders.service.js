/* ======================= Modulos ======================= */
import { OrdersDAOMongoDB } from "../daos/Orders.DAO.js"
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

/* ============ Instancia de container ============ */
let ordersDB = null;

if (config.server.PERS === 'archive') {
    ordersDB = new Container('orders');
} else if (config.server.PERS === 'mongodb') {
    ordersDB = new OrdersDAOMongoDB();
}

/*========================================================*/
/*======================= Services  ======================*/
/*========================================================*/

export async function getAllOrdersData() {
    try {
        return await ordersDB.getAll()
    } catch (error) {
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD')
    }
}

export async function getOrderDataID(id) {
    try {
        let data = await ordersDB.getById(id)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function updateOrderByID(id, obj) {
    try {
        let data = await ordersDB.updateById(id, obj)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function addNewOrder(newObject) {
    try {
        return await ordersDB.save(newObject)
    } catch (error) {
        throw new Error (`Ha ocurrido al guardar el nuevo objeto con nombre: ${newObject.product}`)
    }
}

export async function deleteOrderByID(id) {
    try {
        let data = await ordersDB.deleteById(id);
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al intentar eliminar el objeto con ID: ${id}`)
    }
}