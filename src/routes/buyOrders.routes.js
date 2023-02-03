/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerOrders = express.Router();
import { getAllOrders, getOrderByID, addOrder, updateOrder, deleteOrder } from '../controllers/buyOrders.controllers.js';

/* ============= Routing y metodos ============= */
// Solicitando info de todos los mensajes
routerOrders.get('/', getAllOrders)

// Solicitando info de mensaje segun id
routerOrders.get('/:id', getOrderByID) 

// Actualizacion de objeto en la DB
routerOrders.put('/:id', updateOrder)

// Insercion de objeto nuevo a la DB
routerOrders.post('/', addOrder)

// Borrado de objeto de la DB
routerOrders.delete('/:id', deleteOrder)

/* =========== Exportacion de modulo =========== */
export default routerOrders;