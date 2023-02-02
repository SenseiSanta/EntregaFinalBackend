/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerMessages = express.Router();
import { getAllMessages, getMessageByID, addMessage, updateMessage, deleteMessage } from '../controllers/messages.controllers.js';

/* ============= Routing y metodos ============= */
// Solicitando info de todos los mensajes
routerMessages.get('/', getAllMessages)

// Solicitando info de mensaje segun id
routerMessages.get('/:id', getMessageByID) 

// Actualizacion de objeto en la DB
routerMessages.put('/:id', updateMessage)

// Insercion de objeto nuevo a la DB
routerMessages.post('/', addMessage)

// Borrado de objeto de la DB
routerMessages.delete('/:id', deleteMessage)

/* =========== Exportacion de modulo =========== */
export default routerMessages;