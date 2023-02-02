import { MessagesDAOMongoDB } from "../daos/Messages.DAO.js"
import { config } from '../config/config.js';
import { Container } from '../container/Container.js';

/* ============ Instancia de container ============ */
let msgDB = null;

if (config.server.PERS === 'archive') {
    msgDB = new Container('mensajes')
} else if (config.server.PERS === 'mongodb') {
    msgDB = new MessagesDAOMongoDB()
}

/* ================== Servicios ================== */
export async function getAllMessagesData() {
    try {
        return await msgDB.getAll()
    } catch (error) {
        throw new Error ('Ha ocurrido un error al obtener los datos de la BD')
    }
}

export async function getMsgDataID(id) {
    try {
        let data = await msgDB.getById(id)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function updateMessageByID(id, obj) {
    try {
        let data = await msgDB.updateById(id, obj)
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al obtener los datos del objeto solicitado con ID ${id}`)
    }
}

export async function addNewMessage(newObject) {
    try {
        return await msgDB.save(newObject)
    } catch (error) {
        throw new Error (`Ha ocurrido al guardar el nuevo objeto con nombre: ${newObject.Message}`)
    }
}

export async function deleteMsgByID(id) {
    try {
        let data = await msgDB.deleteById(id);
        return data
    } catch (error) {
        throw new Error (`Ha ocurrido un error al intentar eliminar el objeto con ID: ${id}`)
    }
}