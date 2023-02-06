/* ============== Imports Grales. ============== */
import {logger} from '../utils/logger.js';
import { getAllProductsData, getProdDataID, updateProductByID, addNewProduct, deleteProdByID } from '../services/products.service.js'
import CustomError from '../classes/CustomError.class.js';

/* ============= Mensaje de error ============= */
const internalError = 'Error en el servidor, intente nuevamente';

/* =============== CONTROLADORES =============== */
export async function getAllProducts (req, res) {
    try {
        let productList = await getAllProductsData()
        res.status(200).json({
            status: 200,
            data: productList
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function getProductByID (req, res) {
    try {
        const id = req.params['id'];
        let data = await getProdDataID(id)
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

export async function updateProduct (req, res) {
    try {
        const newObject = {};
        const id = req.params['id'];
        // Verificar que se encuentren los datos necesarios
        let { product, price, img, code, description, stock } = req.body;
        if (product) { newObject["product"] = product };
        if (price) { newObject["price"] = price };
        if (img) { newObject["img"] = img };
        if (code) { newObject["code"] = code };
        if (description) { newObject["description"] = description };
        if (stock) { newObject["stock"] = stock };
        const actualizado = await updateProductByID(id, newObject)
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

export async function addProduct (req, res) {
    let errorDetection = false;
    try {
        let { product, price, img, category, code, description, stock } = req.body;
        // Validacion de datos
        if (!product || !price || !img || !category || !code || !description || !stock) {
            logger.error(`El objeto ${product} no se ha guardado porque faltan datos del mismo`);
            res.status(403).json(new CustomError(403, 'No se ha guardado nada', 'Faltan datos para la creacion del producto'));
        } else {
            let prevData = await getAllProductsData()
            // Validacion de item (no repetido)
            for (let i = 0; i < prevData.length; i++) {
                if (prevData[i].product == product) {
                    errorDetection = true;
                    throw new CustomError(404, 'No se ha guardado nada', 'El producto existe en la Base de datos, intente con otro nombre')
                }
            }
            // Construccion y guardado de producto
            const newObject = {
                product,
                price,
                img,
                category,
                code,
                description,
                stock
            }
            let data = await addNewProduct(newObject);
            res.status(201).json({data});
        }
    } catch (error) {
        switch (errorDetection) {
            case true:
                logger.error(`${error.description}. ${error.message}`);
                res.status(error.status).json({
                    status: error.status,
                    error: `${error.description}. ${error.message}`
                });
                break;
            default:
                logger.error(error);
                res.status(500).json({
                    status: 500,
                    error: internalError
                })
                break;
        }

    }
}

export async function deleteProduct (req, res) {
    try {
        const id = req.params['id'];
        const eliminado = await deleteProdByID(id)
        if (eliminado.state.delete == true) {
            res.status(200).send(eliminado);
        } else {
            logger.error('Error al eliminar el objeto')
            res.status(400).json({error: 'No se elimino nada: Producto no encontrado', ...eliminado})
        }  
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}