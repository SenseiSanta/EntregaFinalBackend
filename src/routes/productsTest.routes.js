/* ============= INICIO DE ROUTEO ============= */
import express from 'express';
const routerProductsTest = express.Router();
import { productMock } from '../mocks/product.mock.js'
import { logger } from '../utils/logger.js';

/* ============ Creacion de objeto ============ */
const container = new productMock();

/* ============= Routing y metodos ============= */
routerProductsTest.get('/', (req, res) => {
    let products = container.generateData()
    logger.info(products)
    res.render('products-test', products)
})

/* =========== Exportacion de modulo =========== */
export default routerProductsTest;