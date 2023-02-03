/*============ Respuesta al cargar o agregar productos ============*/
//ADMIN
socket.on('from-server-product-admin', (products) =>{ 
    renderProductsAdmin(products)
});

//NO ADMIN
socket.on('from-server-product-noAdmin', (products) =>{ 
    renderProductsNoAdmin(products)
});

/*=============== Renderizado de productos ===============*/
//ADMIN
async function renderProductsAdmin(products) { 
    const tableHead = `<tr style="color: yellow;"> <th>Producto</th> <th>Precio</th> <th>Imagen</th> </tr>`;
    const bodyProducts = await products.map(item => {
        return `
        <tr>
            <td>${item.product}</td>
            <td>${item.price}</td>
            <td>
                <img width="30px" src=${item.img} alt="Prod. img">
            </td>
        </tr>`
    }).join('');
    document.getElementById('products-in-DB').innerHTML = tableHead+bodyProducts; 
}

//NO ADMIN
async function renderProductsNoAdmin(products) { 
    const table = `<tr style="color: yellow;"> <th>Productos</th> <th>Precio</th> <th>Imagen</th> <th>Comprar</th> </tr>`;
    const cuerpoProductos = await products.map(item => {
        return `
        <tr>
            <td>${item.product}</td>
            <td>${item.price}</td>
            <td>
                <img width="30px" src=${item.img} alt="Prod. img">
            </td>
            <td> <button onClick='addProdToCart("${item.product}")'> + </button> </td>
        </tr>`
    }).join('');
    document.getElementById('on-sale-products').innerHTML = table+cuerpoProductos; 
}

//Formulario y guardado de productos (Solo ADMIN)
function enviarProducto() {
    const inputProduct = document.querySelector('#product').value
    const inputPrice = document.querySelector('#price').value
    const inputImg = document.querySelector('#img').value
    const inputCode = document.querySelector('#code').value
    const inputDescription = document.querySelector('#description').value
    const inputStock = document.querySelector('#stock').value

    if ((inputProduct=='')||(inputPrice=='')||(inputImg=='')||(inputCode=='')||(inputDescription=='')||(inputStock=='')) {
        let error = document.getElementById('errorProductAdd');
        error.style.display = 'flex';
        error.innerText = 'Faltan datos para procesar el producto nuevo';
        setTimeout(()=>{
            error.style.display = 'none';
        },5000)
    } else {
        const product = {
            product: inputProduct,
            price: inputPrice,
            img: inputImg,
            code: inputCode,
            description: inputDescription,
            stock: inputStock
        }
        socket.emit('from-client-product', product);
    }
}    

// Error cuando se verifica que el producto existe en DB
socket.on('from-server-product-exists', (msg) =>{ 
    let error = document.getElementById('errorProductAdd');
    error.style.display = 'flex';
    error.innerText = msg;
    setTimeout(()=>{
        error.style.display = 'none';
    },5000)
})

socket.on('confirm-prod-delete', async (products) => {
    if (products.length == 0) {
        document.getElementById('cartSection').innerHTML = `<h3 class="noItemsCart"> El carrito esta vacio </h3>`;
    } else {
        let productsSection;
        let cart = document.getElementById('productsCart');
        productsSection = await products.map(item => {
            return `
            <tr>
                <td>${item.product}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
                <td> <button onClick='delProdFromCart("${item.product}")'> -1 </button> </td>
            </tr>`
        }).join('');
        cart.innerHTML = productsSection; 
    }
})

// Agrega productos al carrito
function addProdToCart(product) {
    socket.emit('add-product-to-cart', product);
}

// Elimina productos del carrito
function delProdFromCart(product) {
    socket.emit('del-product-from-cart', product);
}

// Confirmar compra y realizar orden
function buyButton(product) {
    socket.emit('', product);
}