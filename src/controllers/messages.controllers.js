/* ============== Imports Grales. ============== */
import {logger} from '../utils/logger.js';
import { getAllMessagesData, getMsgDataID, updateMessageByID, addNewMessage, deleteMsgByID } from '../services/messages.service.js'
import CustomError from '../classes/CustomError.class.js';

/* ============= Mensaje de error ============= */
const internalError = 'Error en el servidor, intente nuevamente';

/* =============== CONTROLADORES =============== */
export async function getAllMessages (req, res) {
    try {
        let messageList = await getAllMessagesData()
        res.status(200).json({
            status: 200,
            data: messageList
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function getMessageByID (req, res) {
    try {
        const id = req.params['id'];
        let data = await getMsgDataID(id)
        if (data == undefined) {
            res.status(404).json({
                status: 404,
                error: 'No hay ningun ID que coincida con el solicitado, revise los parametros de entrada'
            });
        } else {
            res.status(200).json({
                status: 200,
                data: data
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function updateMessage (req, res) {
    try {
        const newObject = {};
        const id = req.params['id'];
        // Verificar que se encuentren los datos necesarios
        let { author, text } = req.body;
        if (author) { newObject["author"] = author };
        if (text) { newObject["text"] = text };
        const actualizado = await updateMessageByID(id, newObject)
        if (actualizado.state.update == true) {
            res.status(201).json({
                status: 201,
                data: actualizado.state.data
            });
        } else {
            res.status(400).json({
                status: 400,
                error: actualizado.state.data
            })
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function addMessage (req, res) {
    try {
        let { author, text } = req.body;
        if (!author || !text) {
            logger.error(`El mensaje no se ha guardado porque faltan datos del mismo`)
            res.status(403).json(new CustomError(403, 'No se ha guardado nada', 'Faltan datos para la creacion del mensaje')) 
        } else {
            const newObject = {
                author,
                text,
                timestamp: new Date().toLocaleString('es-AR')
            }
            let data = await addNewMessage(newObject);
            res.status(201).json({
                status: 201,
                data: data
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function deleteMessage (req, res) {
    try {
        const id = req.params['id'];
        const eliminado = await deleteMsgByID(id)
        if (eliminado.state.delete == true) {
            res.status(200).json({
                status: 200,
                data: eliminado.state.data
            });
        } else {
            logger.error('Error al eliminar el objeto')
            res.status(400).json({
                status: 400,
                error: eliminado.state.data,
            })
        }  
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}