import { ProductsDAOMongoDB } from "../daos/Products.DAO.js"
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

/* ============ Instancia de container ============ */
let db = null;

if (config.server.PERS === 'archive') {
    db = new Container('productos')
} else if (config.server.PERS === 'mongodb') {
    db = new ProductsDAOMongoDB()
}

/* ================== Servicios ================== */
export async function getAllProductsData() {
    try {
        return await db.getAll()
    } catch (error) {
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD')
    }
}

export async function getProdDataID(id) {
    try {
        let data = await db.getById(id)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function updateProductByID(id, obj) {
    try {
        let data = await db.updateById(id, obj)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function addNewProduct(newObject) {
    try {
        return await db.save(newObject)
    } catch (error) {
        throw new Error (`Ha ocurrido al guardar el nuevo objeto con nombre: ${newObject.product}`)
    }
}

export async function deleteProdByID(id) {
    try {
        let data = await db.deleteById(id);
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al intentar eliminar el objeto con ID: ${id}`)
    }
}