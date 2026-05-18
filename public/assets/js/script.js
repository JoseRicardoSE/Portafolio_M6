// Frontend - Tienda Rey Rick

const API_PRODUCTOS = '/productos';
const API_VENTA = '/venta';

const contenedorProductos = document.getElementById('contenedor-productos');
const inputBuscar = document.getElementById('buscar');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const btnComprar = document.getElementById('btn-comprar');
const toastEl = document.getElementById('toast');
const toastMensaje = document.getElementById('toast-mensaje');
const toast = new bootstrap.Toast(toastEl);

let listaProductos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function formatearPrecio(precio) {
  return '$' + Number(precio).toLocaleString('es-CL');
}

function mostrarToast(mensaje, esError) {
  toastMensaje.textContent = mensaje;
  toastEl.classList.remove('text-bg-success', 'text-bg-danger');
  toastEl.classList.add(esError ? 'text-bg-danger' : 'text-bg-success');
  toast.show();
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function calcularTotal() {
  let total = 0;
  for (const item of carrito) {
    total += item.price * item.quantity;
  }
  return total;
}

function actualizarContador() {
  let cantidad = 0;
  for (const item of carrito) {
    cantidad += item.quantity;
  }
  contadorCarrito.textContent = cantidad;
}

// Mostrar productos en tarjetas
function mostrarProductos(articulos) {
  if (articulos.length === 0) {
    contenedorProductos.innerHTML = '<p class="col-12">No hay productos.</p>';
    return;
  }

  let html = '';
  for (const p of articulos) {
    const sinStock = p.stock === 0;
    html += `
      <div class="col-md-6 mb-4 d-flex">
        <div class="card h-100 w-100">
          <img src="${p.image}" class="card-img-top" alt="${p.title}" style="height: 220px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${p.title}</h5>
            <p class="mb-4">${formatearPrecio(p.price)} - Stock: ${p.stock}</p>
            <button class="btn btn-primary btn-agregar mt-auto" data-id="${p.id}" ${sinStock ? 'disabled' : ''}>
              ${sinStock ? 'Sin stock' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
  contenedorProductos.innerHTML = html;
}

// Mostrar carrito
function renderizarCarrito() {
  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<li class="list-group-item">Carrito vacio</li>';
    btnComprar.disabled = true;
  } else {
    btnComprar.disabled = false;
    let html = '';
    for (const item of carrito) {
      html += `
        <li class="list-group-item">
          <p class="mb-1">${item.title}</p>
          <small>${formatearPrecio(item.price)} x ${item.quantity}</small>
          <div class="mt-1">
            <button class="btn btn-sm btn-secondary btn-menos" data-id="${item.id}">-</button>
            <button class="btn btn-sm btn-secondary btn-mas" data-id="${item.id}">+</button>
          </div>
        </li>
      `;
    }
    listaCarrito.innerHTML = html;
  }
  totalCarrito.textContent = formatearPrecio(calcularTotal());
  actualizarContador();
}

// Cargar productos desde la API
async function obtenerProductos() {
  try {
    const respuesta = await fetch(API_PRODUCTOS);
    if (!respuesta.ok) throw new Error('No se pudieron cargar los productos');
    listaProductos = await respuesta.json();

    // Quitar del carrito productos que ya no existen
    carrito = carrito.filter(c => listaProductos.some(p => p.id === c.id));
    guardarCarrito();

    mostrarProductos(listaProductos);
    renderizarCarrito();
  } catch (error) {
    contenedorProductos.innerHTML = '<p class="text-danger">' + error.message + '</p>';
  }
}

// Agregar al carrito
function agregarAlCarrito(id) {
  const producto = listaProductos.find(p => p.id === id);
  if (!producto || producto.stock === 0) return;

  const enCarrito = carrito.find(i => i.id === id);
  const cantidad = enCarrito ? enCarrito.quantity : 0;

  if (cantidad >= producto.stock) {
    mostrarToast('No hay mas stock', true);
    return;
  }

  if (enCarrito) {
    enCarrito.quantity++;
  } else {
    carrito.push({ id: producto.id, title: producto.title, price: producto.price, image: producto.image, quantity: 1 });
  }

  guardarCarrito();
  renderizarCarrito();
  mostrarToast('Producto agregado', false);
}

// Cambiar cantidad en el carrito
function cambiarCantidad(id, sumar) {
  const index = carrito.findIndex(i => i.id === id);
  const producto = listaProductos.find(p => p.id === id);
  if (index === -1) return;

  if (sumar) {
    if (carrito[index].quantity < producto.stock) {
      carrito[index].quantity++;
    } else {
      mostrarToast('Stock maximo', true);
    }
  } else {
    carrito[index].quantity--;
    if (carrito[index].quantity === 0) {
      carrito.splice(index, 1);
    }
  }

  guardarCarrito();
  renderizarCarrito();
}

// Comprar (POST /venta)
async function realizarCompra() {
  if (carrito.length === 0) return;

  btnComprar.disabled = true;
  const items = carrito.map(i => ({ id: i.id, quantity: i.quantity }));

  try {
    const respuesta = await fetch(API_VENTA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || 'Error en la compra');

    carrito = [];
    guardarCarrito();
    await obtenerProductos();
    mostrarToast('Compra exitosa. Total: ' + formatearPrecio(datos.total), false);
  } catch (error) {
    mostrarToast(error.message, true);
  } finally {
    btnComprar.disabled = carrito.length === 0;
  }
}

// Eventos
contenedorProductos.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-agregar');
  if (btn && !btn.disabled) agregarAlCarrito(btn.dataset.id);
});

listaCarrito.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-mas')) {
    cambiarCantidad(e.target.dataset.id, true);
  }
  if (e.target.classList.contains('btn-menos')) {
    cambiarCantidad(e.target.dataset.id, false);
  }
});

inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase();
  const filtrados = listaProductos.filter(p => p.title.toLowerCase().includes(texto));
  mostrarProductos(filtrados);
});

btnComprar.addEventListener('click', realizarCompra);

// Inicio
obtenerProductos();
