/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerCarts = express.Router();
import { getAllCarts, getCartByID, addCart, addProductToCart, delProductInCart, deleteCart } from '../controllers/carritos.controllers.js';

/* ============= Routing y metodos ============= */
// Solicitando info de todos los carritos
routerCarts.get('/', getAllCarts);

// Solicitando info de carrito segun id
routerCarts.get('/:id', getCartByID);

// Crear un nuevo carrito
routerCarts.post('/', addCart);

// Agrega productos a un carrito
routerCarts.post('/:id/productos', addProductToCart);

//Elimina un producto de un carrito
routerCarts.delete('/:id/productos/:id_prod', delProductInCart);

//Elimina un  carrito
routerCarts.delete('/:id', deleteCart);

/* =========== Exportacion de modulo =========== */
export default routerCarts;