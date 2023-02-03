/* ============== Imports Grales. ============== */
import {logger} from '../utils/logger.js';
import { getAllUsersData, getUserDataID, updateUserByID, addNewUser, deleteUserByID } from '../services/users.service.js'
import CustomError from '../classes/CustomError.class.js';

/* ============= Mensaje de error ============= */
const internalError = 'Error en el servidor, intente nuevamente';

/* =============== Encriptacion =============== */
import bcrypt from 'bcrypt'

async function hashPassGenerator (password) {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

/* =============== CONTROLADORES =============== */
export async function getAllUsers (req, res) {
    try {
        let usersList = await getAllUsersData();
        res.status(200).json(usersList);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: internalError});
    }
}

export async function getUserByID (req, res) {
    try {
        const id = req.params['id'];
        let data = await getUserDataID(id)
        if (data == undefined) {
            res.status(404).json(new CustomError(404, 'No hay datos del id solicitado', 'Ha solicitado un ID que no se encuentra en la Base de datos, intente con otro o revisando los parametros'))
        } else {
            res.status(200).json(data)
        }
    } catch (error) {
        logger.error(error)
        res.status(500).json({error: internalError});
    }
}

export async function updateUser (ctx) {
    try {
        const newObject = {};
        const id = ctx.params.id;
        let { username, password, phone, age, address, email, image, admin } = ctx.request.body;
        if (username) { newObject["username"] = username };
        if (password) { newObject["password"] = password };
        if (phone) { newObject["phone"] = phone };
        if (age) { newObject["age"] = age };
        if (address) { newObject["address"] = address };
        if (email) { newObject["email"] = email };
        if (image) { newObject["image"] = image };
        if (admin) { newObject["admin"] = admin };
        const actualizado = await updateUserByID(id, newObject)
        if (actualizado.state.update == true) {
            ctx.response.status = 201
            ctx.body = {
                status: 201,
                data: actualizado
            }
        } else {
            ctx.response.status = 400
            ctx.body = {
                status: 400,
                data: {error: 'No se actualizo nada: Usuario no encontrado',
                        ...actualizado}
            }
        }
    } catch (error) {
        logger.error(error)
        ctx.response.status = 500
        ctx.body = {
            status: 500,
            data: internalError
        }
    }
}

export async function addUser (req, res) {
    let errorCode;
    try {
        let { username, password, phone, age, address, email, image, admin } = req.body;
        // Validacion de datos
        if (!username || !password || !phone || !age || !address || !email || !image) {
            logger.error(`El usuario ${username} no se ha guardado porque faltan datos del mismo`)
            res.status(404).json(new CustomError(403, 'Faltan datos para guardar el usuario', 'Faltan datos de importancia para guardar el usuario solicitado, por favor intente nuevamente revisando los parametros ingresados'))
        } else {
            let prevData = await getAllUsersData()
            // Validacion de item (no repetido)
            for (let i = 0; i < prevData.length; i++) {
                if (prevData[i].username == username) {
                    errorCode = 1;
                    throw new CustomError(400, 'No se ha guardado nada', 'El usuario existe en la Base de datos, intente con otro nombre')
                }
            }
            const newUser = {
                username,
                password: await hashPassGenerator(password),
                phone,
                age,
                address,
                email,
                image,
                admin: admin || false
            }
            let data = await addNewUser(newUser);
            res.status(201).json(data)
        }
    } catch (error) {
        switch (errorCode) {
            case 1:
                logger.error(`${error.description}. ${error.message}`);
                res.status(error.status).json(error)
                break;
            default:
                logger.error(error);
                res.status(500).json({error: internalError})
                break;
        }
    }
}

export async function deleteUser (ctx) {
    try {
        const id = ctx.params.id;
        const eliminado = await deleteUserByID(id)
        if (eliminado.state.delete == true) {
            ctx.response.status = 200
            ctx.body = {
                status: 200,
                data: eliminado
            }
        } else {
            logger.error('Error al eliminar el usuario')
            ctx.response.status = 400
            ctx.body = {
                status: 400,
                error: 'No se elimino nada: Usuario no encontrado',
                data: eliminado
            }
        }  
    } catch (error) {
        logger.error(error)
        ctx.response.status = 500
        ctx.body = {
            status: 500,
            data: internalError
        }
    }
}
