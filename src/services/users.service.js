/* ======================= Modulos ======================= */
import { UsersDAOMongoDB } from "../daos/Users.DAO.js"
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

/* ============ Instancia de container ============ */
let db = null;

if (config.server.PERS === 'archive') {
    db = new Container('productos');
} else if (config.server.PERS === 'mongodb') {
    db = new UsersDAOMongoDB();
}

/*========================================================*/
/*======================= Services  ======================*/
/*========================================================*/

export async function getAllUsersData() {
    try {
        return await db.getAll()
    } catch (error) {
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD')
    }
}

export async function getUserDataID(id) {
    try {
        let data = await db.getById(id)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function updateUserByID(id, obj) {
    try {
        let data = await db.updateById(id, obj)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function addNewUser(newUser) {
    try {
        return await db.save(newUser)
    } catch (error) {
        throw new Error (`Ha ocurrido al guardar el nuevo usuario con nombre: ${newUser.username}`)
    }
}

export async function deleteUserByID(id) {
    try {
        let data = await db.deleteById(id);
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al intentar eliminar el usuario con ID: ${id}`)
    }
}