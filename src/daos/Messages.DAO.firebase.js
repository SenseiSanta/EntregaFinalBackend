import admin from 'firebase-admin';
import { createRequire } from "module";
import { ContainerFirebase } from '../container/ContainerFirebase.js';
const require = createRequire(import.meta.url);
const serviceAccount = require("../../DB/crt/desafioclase20-firebase-adminsdk-hhz23-0a02b3cd01.json")

//Conecta
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

export class MessagesDAOFirebase extends ContainerFirebase {
    constructor(){
        super('mensajes')
    }
}