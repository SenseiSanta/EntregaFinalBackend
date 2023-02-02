// --- Tablas para usar Maria y SQLite ---
import knex from 'knex';
import { configMaria, configSQLite } from '../utils/config.js'

const knexCliMaria = knex(configMaria.db);
const knexCliSQLite = knex(configSQLite.db);

knexCliMaria.schema.dropTableIfExists('messages')
    .then(()=>{
        knexCliMaria.schema.createTable('messages', table => {
            table.increments('id').primary()
            table.string('author', 50).notNullable();
            table.string('text', 100).notNullable();
            table.string('date', 50).notNullable();
        })
            .then(()=> console.log("Tabla Mensajes Creada"))
            .catch(err=>{
                console.log(err);
                throw err;
            })
            .finally(()=>{
                knexCliMaria.destroy()
            })
    })

knexCliSQLite.schema.dropTableIfExists('products')
    .then(()=>{
        knexCliSQLite.schema.createTable('products', table => {
            table.increments('id').primary()
            table.string('producto', 50).notNullable();
            table.integer('precio', 30).notNullable();
            table.string('img', 100).notNullable();
        })
            .then(()=> console.log("Tabla Productos Creada"))
            .catch(err=>{
                console.log(err);
                throw err;
            })
            .finally(()=>{
                knexCliSQLite.destroy()
            })
    })