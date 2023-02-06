/*=============== Denormalizacion de datos ===============*/
const schemaAuthors = new normalizr.schema.Entity('author', {}, {idAttribute: 'email'})
const schemaMensaje = new normalizr.schema.Entity('post', {author: schemaAuthors}, {idAttribute: 'id'})
const schemaMensajes = new normalizr.schema.Entity('posts', {mensajes: [schemaMensaje]}, {idAttribute: 'id'})

//Respuesta cuando se envia mensaje
socket.on('from-server-message', messages =>{ 
    let mensajesNormSIZE = JSON.stringify(messages).length;
    let mensajesDenorm = normalizr.denormalize(messages.result, schemaMensajes, messages.entities);
    let mensajesDenormSIZE = JSON.stringify(mensajesDenorm.messages).length;
    let compresion = parseInt((mensajesNormSIZE * 100) / mensajesDenormSIZE );
    //document.getElementById('compresionText').innerText = 'Compresion ' + compresion + '%'
    renderMessages(mensajesDenorm.messages)
})

/*=============== Renderizado de mensajes ===============*/
function renderMessages(messages) { 
    const cuerpoMensaje = messages.map(msg => {
        return `<span> <span style="color: blue; font-weight: bold; font-size: 22px">${msg.author}</span>
                <span style="color: brown; font-size: 12px"> (${msg.timestamp})</span>
                :
                <span style="color: green; font-style: italic">${msg.text}</span></span>`
    }).join('')
    document.querySelector('#chatHistorial').innerHTML = cuerpoMensaje;
}

/*=============== Presionar boton cuando manda mensaje ===============*/
function enviarMensaje(user) {
    const inputMsg = document.getElementById("commentary")
    const timestamp = new Date().toLocaleString('es-AR')

    const msg = {
        author: user,
        text: inputMsg.value,
        timestamp: timestamp
    }
    socket.emit('from-client-message', msg);
}