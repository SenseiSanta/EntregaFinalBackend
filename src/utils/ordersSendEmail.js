import { createTransport } from "nodemailer";
import * as dotenv from 'dotenv'
import { logger } from "../utils/logger.js";
dotenv.config({path:'../../.env'})

/* Configuracion de mail y proceso de envio */
export async function orderEmailConfirmation(order){

    let user = order.username;
    let email = order.email;
    let idCompra = order._id;

    /* Configuracion de quien envia */
    const transporter = createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS
    }
});
    
    const orderConfirm_MailOptions = {
        from: 'CoderHouse - App Olivera <noreply@myapp.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `Nuevo pedido del usuario ${user}`,
        text: `${user} ha realizado una nueva orden de compra que debe ser confirmada.`,
        html: `<p style="font-size: 20px"> <strong> El usuario ${user} tiene un nuevo pedido de compra. ID: ${idCompra} </strong> </p> <p> Datos del usuario: </p> <p> Email:  ${user}</p> </br> <p> Email:  ${email}</p>`
    }
    
    try {
        const info = await transporter.sendMail(orderConfirm_MailOptions)
    } catch (error) {
        logger.error(error)
    }
}


