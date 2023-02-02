import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/* ============== Config ============== */
let cnxStringMongo = null;

/* ==== MongoDB String declaration ==== */
if (process.env.NODE_ENV == 'development') {
    cnxStringMongo = process.env.MONGO_LOCAL_DB
} else if (process.env.NODE_ENV == 'production') {
    cnxStringMongo = process.env.MONGO_ATLAS_DB
}

export const configMongoDB = {
    db: {
        cnxString: cnxStringMongo,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        }
    }
}

export const config = {
    server: {
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        PERS: process.env.PERS
    }
}


/*============================================================*/
/*========================== Extras ==========================*/
/*============================================================*/

/* Configuraciones de Maria y SQLite */

/* export const configMaria = {
    db: {
        client: 'mysql',
        connection: {
            host: '127.0.0.1',
            user: 'santiago',
            password: 'santiago',
            database: 'entrega11mensajes'
        }
    }
}

export const configSQLite = {
    db: {
        client: 'better-sqlite3',
        connection: {
            filename: path.join(__dirname, '../../DB/products.db3')
        },
        useNullAsDefault: true
    }
} */