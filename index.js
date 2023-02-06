/*=================== MODULOS ===================*/
import express from "express";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import os from "os";
import cluster from "cluster";
import multer from "multer";
import { config } from "./src/config/config.js";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { orderEmailConfirmation as orderEmail } from "./src/utils/ordersSendEmail.js";

/*=================== Logger ===================*/
import { logger } from "./src/utils/logger.js";
//import morgan from "morgan";

/*============ Instancia de Server ============*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

/*================== Routers ==================*/
import routerProducts from "./src/routes/products.routes.js";
import routerCarts from "./src/routes/carts.routes.js";
import routerInitial from "./src/routes/initial.routes.js";
import routerProductsTest from "./src/routes/productsTest.routes.js";
import routerUsers from "./src/routes/users.routes.js"
import routerMessages from "./src/routes/messages.routes.js"
import routerOrders from "./src/routes/buyOrders.routes.js"

/*================ Multer Setup ================*/
const storage = multer.diskStorage({
  destination: path.join('public/img/userImg'),
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})
export const upload = multer({
  storage,
  dest: 'public/img/userImg'
})

/*================= Middlewears =================*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(morgan("dev"));
app.use(compression());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')))
app.use(multer({
  storage,
  dest: 'public/img/userImg'
}).single('image'))

/*================ Session Setup ================*/
import { sessionMiddleware, wrap } from './src/config/serverSessionConfig.js' 

app.use(sessionMiddleware)

/*============= Motor de plantillas =============*/
app.engine(
  "hbs",
  exphbs.engine({
    defaulyLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: "hbs",
  })
);
app.set("views", path.join("views"));
app.set("view engine", "hbs");

/*==================== Rutas ====================*/
app.use("/", routerInitial);
app.use("/api/productos", routerProducts);
app.use("/api/mensajes", routerMessages)
app.use("/api/carritos", routerCarts);
app.use("/api/productos-test", routerProductsTest);
app.use("/api/usuarios", routerUsers);
app.use("/api/ordenes", routerOrders);
app.all("*", (req, res) => {
  let method = req.method;
  let url = req.url;
  res.status(404).render('routeError', {method, url})
});

/*============================================================*/
/*========================= Servidor =========================*/
/*============================================================*/

/*============== Minimist config ==============*/
import minimist from "minimist";
const minimistOptions = {default: {p: config.server.PORT, m: 'FORK', s: config.server.NODE_ENV}}
const proceso = minimist(process.argv, minimistOptions)

/*=============== Server config ==============*/
export const PORT = process.argv[2] || proceso.p;
const SERVER_MODE = proceso.m;
const NODE_ENV = proceso.s;
const CPU_CORES = os.cpus().length;

/*=============== Server start ===============*/
if (cluster.isPrimary && SERVER_MODE == 'CLUSTER') {
  logger.info('Cantidad de cores: ', CPU_CORES)
  for (let i = 0; i < CPU_CORES; i++) {
    cluster.fork()
  }
  cluster.on('exit', worker => {
    logger.info(`Worker ${process.pid}, ${worker.id} finaliza ${new Date().toLocaleDateString()}`);
    cluster.fork()
  })
} else {
  const server = httpServer.listen(PORT, () => {
    logger.info(`Servidor escuchando en puerto ${PORT} -- proceso: ${process.pid} en modo ${NODE_ENV}`);
  });
  server.on("error", (error) => logger.error(`${new Date().toLocaleDateString()}: Inconveniente en el servidor -> ${error}`));
}

/*========== Solicitar servicios ==========*/
import { getProductDB, getUserFromDB, getMessagesDB, saveMessageFromSocket, saveProductFromSocket, getProductByName, searchUserCart, postNewOrder } from './src/services/server.service.js'

io.use(wrap(sessionMiddleware))

io.on("connection", async (socket) => {
  logger.info(`Nuevo cliente conectado -> ID: ${socket.id}`);
  const req = socket.request;
  if (req.session.passport) {
    const DB_MESSAGES = await listNormalizedMessages();
    const DB_PRODUCTS = await getProductDB();
    const username = req.session.passport.user;
    const user = await getUserFromDB(username);
    const isAdmin = user[0].admin;
    io.sockets.emit("from-server-message", DB_MESSAGES);
    if (isAdmin) {
      io.sockets.emit("from-server-product-admin", DB_PRODUCTS);
    } else {
      io.sockets.emit("from-server-product-noAdmin", DB_PRODUCTS);
    }
  }
  
  // Envio de mensaje
  socket.on("from-client-message", async (msg) => {
    await saveMessageFromSocket(msg);
    const MESSAGES = await listNormalizedMessages();
    io.sockets.emit("from-server-message", MESSAGES);
  });

  // Creacion de producto (solo admins)
  socket.on("from-client-product", async (product) => {
    let productExists = await getProductByName(product.product)
    if (productExists == undefined) {
      await saveProductFromSocket(product);
      const PRODUCTS = await getProductDB();
      io.sockets.emit("from-server-product-admin", PRODUCTS);
      io.sockets.emit("from-server-product-noAdmin", PRODUCTS);
    } else {
      let msg = 'El producto existe en la DB'
      io.sockets.emit("from-server-product-exists", msg)
    }
  });

  socket.on("add-product-to-cart", async (product) => {
    try {
      let user = req.session.passport.user
      let cart = await searchUserCart(user);
      if (cart == undefined) {
        throw new Error (`Hay un problema con el carrito de ${user}. Avise a nuestros administradores para corregir el inconveniente`)
      } else {
        let selectedProduct = await getProductByName(product)
        if (selectedProduct == undefined) {
          throw new Error (`Hay un problema con el producto elegido. Avise a nuestros administradores para corregir el inconveniente`)
        } else {
          let { product, price, _id } = selectedProduct[0];
          let productExistsCart = cart[0].products.find(element => element.product == product);
          if (productExistsCart == undefined) {
              cart[0].products.push({
                _id,
                product,
                price,
                qty: 1})
          } else {
              let index = cart[0].products.indexOf(productExistsCart)
              cart[0].products[index].qty++
          }
          let insertProduct = await updateCart(cart[0], cart[0]._id)
          if (insertProduct) {
              console.log('Agregado exitosamente')
          } else {
              throw new Error ('Algo ha ocurrido queriendo agregar el item al carrito')
          }
        }
      }
    } catch (error) {
      logger.error(error)
    }
  })

  socket.on('del-product-from-cart', async (product) => {
    try {
      let user = req.session.passport.user;
      let cart = await searchUserCart(user);
      if (cart == undefined) {
        throw new Error (`Hay un problema con el carrito de ${user}. Avise a nuestros administradores para corregir el inconveniente`)
      } else {
        let selectedProduct = await getProductByName(product)
        if (selectedProduct == undefined) {
          throw new Error (`Hay un problema con el producto elegido. Avise a nuestros administradores para corregir el inconveniente`)
        } else {
              let { product } = selectedProduct[0];
              let productExistsCart = cart[0].products.find(element => element.product == product);
              if (productExistsCart == undefined) {
                throw new Error (`El producto que intenta borrar no se encuentra en el carrito`)
              } else {
                  let index = cart[0].products.indexOf(productExistsCart);
                  let cartStatus;
                  if (cart[0].products[index].qty > 1) {
                      cart[0].products[index].qty--
                  } else {
                      cart[0].products.splice(index, 1)
                  }
                  cartStatus = await updateCart(cart[0], cart[0]._id)
                  if (cartStatus) {
                    socket.emit('confirm-prod-delete', cart[0].products)
                  } else {
                    throw new Error ('No se ha eliminado')
                  }
              }
          }
      }
    } catch (error) {
      logger.error(error);
    }
  });

  socket.on('confirm-buy-order', async () => {
    try {
      let user = req.session.passport.user;
      let userData = await getUserByUsername(user)
      let { email } = userData[0]
      let userCart = await searchUserCart(user);
      let order = await postNewOrder(userCart[0], user, email)
      console.log(order)
      if (order != false) {
        let productsQty = userCart[0].products.length;
        userCart[0].products.splice(0, productsQty)
        let cartReset = await updateCart(userCart[0], userCart[0]._id)
        if (cartReset) {
          console.log('Perfecto')
          orderEmail(order)
        } else {
          throw new Error ('El carrito no fue reiniciado')
        }
      } else {
        throw new Error ('Su orden no ha sido procesada, intente nuevamente mas tarde')
      }
    } catch (error) {
      logger.error(error)
    }
  });
});

/*=============== Normalizacion de datos ===============*/
import { normalize, schema, denormalize } from "normalizr";
import compression from "compression";
import { updateCart, getDataID } from './src/services/carts.service.js';
import { getUserByUsername } from "./src/services/initial.service.js";

const schemaAuthors = new schema.Entity("author", {}, { idAttribute: "email" });
const schemaMensaje = new schema.Entity(
  "post",
  { author: schemaAuthors },
  { idAttribute: "id" }
);
const schemaMensajes = new schema.Entity(
  "posts",
  { mensajes: [schemaMensaje] },
  { idAttribute: "id" }
);

const normalizeMessages = (messageID) =>
  normalize(messageID, schemaMensajes);

async function listNormalizedMessages() {
  const messages = await getMessagesDB();
  const normalized = normalizeMessages({ id: "mensajes", messages });
  return normalized;
}

export default httpServer