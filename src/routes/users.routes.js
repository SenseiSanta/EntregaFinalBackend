/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerUsers = express.Router();
import { getAllUsers, getUserByID, addUser, updateUser, deleteUser } from '../controllers/users.controllers.js';

/* ============= Routing y metodos ============= */
// Solicitando info de todos los productos
routerUsers.get('/', getAllUsers)

// Solicitando info de producto segun id
routerUsers.get('/:id', getUserByID) 

// Actualizacion de objeto en la DB
routerUsers.put('/:id', updateUser)

// Insercion de objeto nuevo a la DB
routerUsers.post('/', addUser)

// Borrado de objeto de la DB
routerUsers.delete('/:id', deleteUser)

/* =========== Exportacion de modulo =========== */
export default routerUsers;