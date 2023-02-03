/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerProducts = express.Router();
import { getAllProducts, getProductByID, addProduct, updateProduct, deleteProduct } from '../controllers/products.controllers.js';

/* ============= Routing y metodos ============= */
// Solicitando info de todos los productos
routerProducts.get('/', getAllProducts)

// Solicitando info de producto segun id
routerProducts.get('/:id', getProductByID) 

// Actualizacion de objeto en la DB
routerProducts.put('/:id', updateProduct)

// Insercion de objeto nuevo a la DB
routerProducts.post('/', addProduct)

// Borrado de objeto de la DB
routerProducts.delete('/:id', deleteProduct)

/* =========== Exportacion de modulo =========== */
export default routerProducts;