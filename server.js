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
app.all("*", (req, res) => {
  res.status(404).json({
    status: 404,
    route: `${req.method} ${req.url}`,
    msg: `No implemented route`
  })
});

app.get('/datos', (req, res) => {
  res.status(200).send(`Servidor escuchando en puerto ${puerto}, proceso N ${process.pid}`)
})

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
import { getProductDB, getUserFromDB, getMessagesDB, saveMessageFromSocket, saveProductFromSocket } from './src/services/server.service.js'

io.use(wrap(sessionMiddleware))

io.on("connection", async (socket) => {
  logger.info(`Nuevo cliente conectado -> ID: ${socket.id}`);
  const req = socket.request;
  if (req.session.passport) {
    const DB_MESSAGES = await listNormalizedMessages();
    const DB_PRODUCTS = await getProductDB();
    const username = req.session.passport.user;
    const user = await getUserFromDB(username);
    const isAdmin = user.admin;
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
    await saveProductFromSocket(msg);
    const PRODUCTS = await getProductDB();
    io.sockets.emit("from-server-product-admin", PRODUCTS);
  });
});

/*=============== Normalizacion de datos ===============*/
import { normalize, schema, denormalize } from "normalizr";
import compression from "compression";

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