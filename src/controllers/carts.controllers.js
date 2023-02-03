/* ============== Imports Grales. ============== */
import { logger } from '../utils/logger.js';
import { getAllCartData, getDataID, addNewCart, updateCart, deleteCartByID, searchCartByOwner } from '../services/carts.service.js'
import { getProdDataID } from '../services/products.service.js';

/* ============= Mensaje de error ============= */
const internalError = 'Error en el servidor, intente nuevamente';

/* =============== CONTROLADORES =============== */
export async function getAllCarts (req, res) {
    try {
        let cartList = await getAllCartData()
        res.status(200).json({
            status: 200,
            data: cartList
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function getCartByID (req, res) {
    try {
        const id = req.params['id'];
        let data = await getDataID(id)
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
        logger.error(error)
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function getCartByOwner (req, res) {
    try {
        const user = req.params['user'];
        let data = await searchCartByOwner(user)
        if (data == undefined) {
            res.status(404).json({
                status: 404,
                error: 'No hay ningun usuario que coincida con lo solicitado, revise los parametros de entrada'
            });
        } else {
            res.status(200).json({
                status: 200,
                data: data
            });
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function addCart (req, res) {
    try {
        let state = await addNewCart();
        if (state == false) {
            logger.error('El carrito no se pudo crear, revise en carritos.controllers.js')
            res.status(400).json({
                status: 400,
                error: 'El carrito no fue creado, intente nuevamente'
            })
        } else {
            res.status(201).json({
                status: 201,
                data: 'Carrito agregado'});
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function addProductToCart (req, res) {
    try {
        const cartId = req.params['id'];
        const prodId = req.body.id;
        let cartData = await getDataID(cartId);
        if (cartData == undefined) {
            res.status(404).json({
                status: 404,
                error: 'No se ha encontrado ningun carrito con ese id, por favor revise los parametros ingresados'
            });
        } else {
            let productData = await getProdDataID(prodId);
            if (productData == undefined) {
                res.status(404).json({
                    status: 404,
                    error: 'No se ha encontrado ningun producto con ese id, por favor revise los parametros ingresados'
                });
            } else {
                let { product, price, _id } = productData;
                let productExistsCart = cartData.products.find(element => element.product == product);
                if (productExistsCart == undefined) {
                    cartData.products.push({
                        _id,
                        product,
                        price,
                        qty: 1})
                } else {
                    let index = cartData.products.indexOf(productExistsCart)
                    cartData.products[index].qty++
                }
                let insertProduct = await updateCart(cartData, cartId)
                if (insertProduct) {
                    res.status(200).json({
                        status: 200,
                        data: `El producto ${product} se ha agregado al carrito de ${cartData.owner}`
                    });
                } else {
                    res.status(400).json({
                        status: 400,
                        error: 'Al parecer no se ha actualizado el carrito debido a un problema interno'
                    });
                }
            }
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function delProductInCart (req, res) {
    try {
        const cartID = req.params['id'];
        const prodID = req.params['id_prod'];
        const cartData = await getDataID(cartID);
        if (cartData == undefined) {
            res.status(404).json({
                status: 404,
                error: 'No hay ningun ID que coincida con el carrito solicitado, revise los parametros de entrada'
            });
        } else {
            const productData = await getProdDataID(prodID);
            if (productData == undefined){
                res.status(404).json({
                    status: 404,
                    error: 'No hay ningun ID que coincida con el producto solicitado, revise los parametros de entrada'
                });
            } else {
                let { product } = productData;
                let productExistsCart = cartData.products.find(element => element.product == product);
                if (productExistsCart == undefined) {
                    res.status(404).json({
                        status: 404,
                        error: `Este producto no se encuentra en el carrito de ${cartData.owner}`
                    });
                } else {
                    let index = cartData.products.indexOf(productExistsCart);
                    let cartStatus;
                    if (cartData.products[index].qty > 1) {
                        cartData.products[index].qty--
                    } else {
                        cartData.products.splice(index, 1)
                    }
                    cartStatus = await updateCart(cartData, cartID)
                    if (cartStatus) {
                        res.status(200).json({status: 200,
                                            data: `El producto ${product} se ha item del carrito de ${cartData.owner}`});
                    } else {
                        res.status(400).json({
                            status: 400,
                            error: 'Al parecer no se ha actualizado el carrito debido a un problema interno'
                        });
                    }
                }
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

export async function deleteCart (req, res) {
    try {
        const id = req.params['id'];
        const item = await deleteCartByID(id)
        if (item.state.delete == true) {
            res.status(200).json({
                status: 200,
                data: item.state.data
            })
        } else {
            logger.error('Error al eliminar el objeto')
            res.status(404).json({
                status: 404,
                error: 'No se elimino nada: Carrito no encontrado'
            })
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}