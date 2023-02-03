/* ============ Imports Grales. ============ */
import {getMessages, getProducts, getUsers, getUserById, saveInfoUser, searchCartByOwner} from '../services/initial.service.js'
import { logger } from '../utils/logger.js';
import {registerEmailConfirmation as adminEmail} from '../utils/registerSendEmail.js';
import { PORT } from '../../server.js';
import os from 'os';

/* =================== DTO =================== */
import ProductDTO from '../classes/DTOProducts.class.js';

/* ============ Mensaje de error ============ */
const internalError = 'Error en el servidor, intente nuevamente'

/* ================== Mocks ================== */
import { productMock } from '../mocks/product.mock.js';

/* ============= Creacion de fork ============ */
import { fork } from 'child_process';
const forkProcess = fork('./src/utils/apiRandomNumber.js')

/* =============== Passport =============== */
import passport from 'passport';
import { Strategy } from 'passport-local'
const LocalStrategy = Strategy;

passport.use(new LocalStrategy(
async function(username, password, done) {
    let person = await getUsers()
    let existsUser = person.find(someone => someone.username == username)
        if (!existsUser) {
            return done(null, false)
        } else {
            const match = await verifyPassword(existsUser, password)
            if (!match) {
                return done(null, false)
            }
            return done(null, existsUser)
        }
    }
));

passport.serializeUser((person, done)=>{
    done(null, person.username)
})

passport.deserializeUser(async (username, done)=> {
    let person = await getUsers()
    let existsUser = person.find(someone => someone.username == username)
    done(null, existsUser)
})

/* =============== Encriptacion =============== */
import bcrypt from 'bcrypt'
import { getUserByUsername, addNewCart as cartAssignment } from '../services/initial.service.js';

async function hashPassGenerator (password) {
    const hashPassword = await bcrypt.hash(password, 10)
    return hashPassword
}

async function verifyPassword(user, pass) {
    const match = await bcrypt.compare(pass, user.password);
    return match
}

/* ============================================= */
/* ======/======== CONTROLADORES =======/======= */
/* ============================================= */

// Obtencion y renderizado de datos para la sesion
export async function getMainInfo(req, res) {
    try {
        const username = req.user.username;
        const phone = req.user.phone;
        const age = req.user.age;
        const image = req.user.image;
        const email = req.user.email;
        const address = req.user.address;
        const admin = req.user.admin;
        const messages = await getMessages()
        const products = await getProducts()
        const productsDTO = products.map( item => {
            return new ProductDTO(item)
        })
        res.status(200).render('general', {productsDTO, messages, username, phone, age, image, email, address, admin})
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Renderizado de la pagina de logueo
export async function loginPage(req, res) {
    try {
        res.status(200).render('login')
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Renderizado de la pagina del error de logueo
export async function loginPageError(req, res) {
    try {
        res.status(200).render('login-error')
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Renderizado de la pagina del REGISTRO
export async function registerPage(req, res) {
    try {
        res.status(200).render('register')
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Procesamiento de las credenciales de REGISTRO
export async function registerCredentials(req, res) {
    try {
        const { username, password, phone, age, address, email } = req.body;
        let infoUser = {
        username: username,
        password: await hashPassGenerator(password),
        phone: phone,
        age: age,
        address: address,
        email: email,
        image: req.file.filename,
        admin: false
        }
        if (username || password) {
            if (username == 'unassigned') {
                const invalidUserTagError = 'Ese nombre de usuario no puede ser utilizado en este sitio, intente con otro'
                res.status(200).render('register', {invalidUserTagError})
            } else {
                let user = await getUserByUsername(username)
                if (user == undefined) {
                    let guardarDatos = await saveInfoUser(infoUser)
                    let createCart = await cartAssignment(infoUser.username)
                    if (createCart == false) {
                        logger.error(`El carrito para ${infoUser.username} no fue creado`)
                    }
                    //sending email confimation to admin
                    adminEmail(infoUser)
                    res.status(201).redirect('/login')
                } else {
                    const errorRegister = 'El usuario que intenta registar ya existe, intente con otro nombre'
                    res.status(200).render('register', {errorRegister})
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

//Renderizado de la pagina del CARRITO
export async function cartPage(req, res) {
    try {
        const username = req.user.username;
        const admin = req.user.admin;
        const cart = await searchCartByOwner(username)
        const products = cart[0].products
        products.forEach(element => {
            element.price = element.price * element.qty
        });
        res.status(200).render('cart', {username, products, admin})
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Renderizado de la pagina del CHAT
export async function chatPage(req, res) {
    try {
        const username = req.user.username;
        const admin = req.user.admin;
        res.status(200).render('chat', {username, admin})
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Cierre de sesion
export async function logout(req, res) {
    try {
        req.session.destroy((error) => {
            if (error) {
                throw new Error (error);
            } else {
                logger.info('logout ok');
                res.status(200).redirect('/login');
            }
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Generacion de productos random de la ruta -> /api/productos-test
export async function generateRandomProd (req, res) {
    try {
        const cajaRandom = new productMock();
        let products = cajaRandom.generateData()
        res.status(200).render('products-test', {products})
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}

//Visualizacion de la informacion de los componentes del servidor -> /info
export async function getServerInfo (req, res) {
    try {
        const serverDeployment = process.env.NODE_ENV;
        const processArgs = process.argv.slice(2);
        const processMemory = process.memoryUsage().rss;
        const processDirectory = process.cwd();
        const CPU_CORES = os.cpus().length;
        res.status(200).render('info', {process, processArgs, processMemory, processDirectory, CPU_CORES, PORT, serverDeployment});
    } catch (error) {
        const cajaRandom = new productMock();
        let products = cajaRandom.generateData()
        res.status(200).render('products-test', {products})
    }
}

//Trabajo en fork para la tirada de numeros random -> /api/randoms
export async function getRandomThrows(req, res) {
    try {
        let { qty } = req.query 
        qty == undefined ? qty = 100000 : logger.warn('Hubo un inconveniente al definir la cantidad de tiros random')
    
        forkProcess.send(qty)
        forkProcess.on("message", msg => {
            res.status(200).render('apiRandoms', {msg})
        })
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 500,
            error: internalError
        })
    }
}