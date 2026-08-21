/* ================================================
   LIBRERÍA EL TÚNEL — app.js
   Frontend conectado a API Node.js + PostgreSQL
   Versión: 2.0
   ================================================ */

'use strict';

// ─── CONSTANTES ───────────────────────────────────
const LIBROS_POR_PAGINA = 6;

// ─── VARIABLES GLOBALES ───────────────────────────
let todosLosLibros   = [];   // todos los libros cargados desde la API
let librosFiltrados  = [];   // libros después de filtrar/buscar
let paginaActual     = 1;
let usuarioActual    = null; // datos del usuario logueado
let timeoutBusqueda  = null;

// ─── REFERENCIAS AL DOM ───────────────────────────
const productosGrid    = document.getElementById('productos');
const sinResultados    = document.getElementById('sin-resultados');
const paginacionDiv    = document.getElementById('paginacion');
const busquedaInput    = document.getElementById('busqueda');
const btnBuscar        = document.getElementById('btn-buscar');
const categoriaSelect  = document.getElementById('categoria');
const contadorCarrito  = document.getElementById('contador-carrito');
const carritoIcono     = document.getElementById('carrito-icono');
const modalCarrito     = document.getElementById('modal-carrito');
const cerrarCarrito    = document.getElementById('cerrar-carrito');
const carritoItems     = document.getElementById('carrito-items');
const carritoVacio     = document.getElementById('carrito-vacio');
const carritoTotal     = document.getElementById('carrito-total');
const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
const pagarBtn         = document.getElementById('pagar');
const modalLogin       = document.getElementById('modal-login');
const cerrarLogin      = document.getElementById('cerrar-login');
const btnAbrirLogin    = document.getElementById('btn-abrir-login');
const btnLogout        = document.getElementById('btn-logout');
const nombreUsuario    = document.getElementById('nombre-usuario');
const tabLogin         = document.getElementById('tab-login');
const tabRegistro      = document.getElementById('tab-registro');
const formLogin        = document.getElementById('form-login');
const formRegistro     = document.getElementById('form-registro');
const errorLogin       = document.getElementById('error-login');
const errorRegistro    = document.getElementById('error-registro');
const toast            = document.getElementById('toast');

// ══════════════════════════════════════════════════
//  🚀 INICIALIZACIÓN
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  await verificarSesion();
  await cargarLibrosDesdeAPI();
  iniciarBusquedaAsincrona();
  registrarEventos();
});

// ══════════════════════════════════════════════════
//  📚 CARGA DE LIBROS DESDE LA API
// ══════════════════════════════════════════════════

/**
 * Carga todos los libros desde /api/libros
 */
async function cargarLibrosDesdeAPI() {
  try {
    const respuesta = await fetch('/api/libros');
    const datos     = await respuesta.json();

    if (datos.status === 'success') {
      todosLosLibros  = datos.data.libros;
      librosFiltrados = [...todosLosLibros];
      paginaActual    = 1;
      cargarProductos();
    } else {
      mostrarToast('⚠️ No se pudieron cargar los libros', 'error');
    }
  } catch (error) {
    console.error('❌ Error al cargar libros:', error.message);
    mostrarToast('❌ Error al conectar con el servidor', 'error');
  }
}

// ══════════════════════════════════════════════════
//  🃏 RENDERIZADO DE TARJETAS
// ══════════════════════════════════════════════════

/**
 * Renderiza los libros de la página actual en el grid
 */
function cargarProductos() {
  productosGrid.innerHTML = '';

  if (librosFiltrados.length === 0) {
    sinResultados.classList.remove('oculto');
    paginacionDiv.innerHTML = '';
    return;
  }

  sinResultados.classList.add('oculto');

  // Calcular rango de la página actual
  const inicio = (paginaActual - 1) * LIBROS_POR_PAGINA;
  const fin    = inicio + LIBROS_POR_PAGINA;
  const librosEnPagina = librosFiltrados.slice(inicio, fin);

  librosEnPagina.forEach(libro => {
    const tarjeta = crearTarjeta(libro);
    productosGrid.appendChild(tarjeta);
  });

  renderizarPaginacion();
}

/**
 * Crea el elemento HTML de una tarjeta de libro
 * @param {Object} libro
 * @returns {HTMLElement}
 */
function crearTarjeta(libro) {
  const div = document.createElement('div');
  div.classList.add('producto-tarjeta');

  // Ruta de imagen con fallback
 // ✅ CÓDIGO CORREGIDO
  const imagenSrc = libro.imagen
    ? `img/libros-img/${libro.imagen}`
    : 'img/libros-img/principito.webp';

  div.innerHTML = `
      <div class="producto-imagen">
        <img
          src="${imagenSrc}"
          alt="${libro.titulo}"
          onerror="this.src='img/libros-img/principito.webp'; this.onerror=null;"
        >
      </div>
    <div class="producto-info">
      <h3 class="producto-titulo">${libro.titulo}</h3>
      <p class="producto-autor">${libro.autor || ''}</p>
      <p class="producto-categoria">${libro.categoria || ''}</p>
      <p class="producto-precio">$${parseFloat(libro.precio || 0).toFixed(2)}</p>
      <p class="producto-stock ${libro.stock <= 0 ? 'sin-stock' : ''}">
        ${libro.stock > 0 ? `Stock: ${libro.stock}` : 'Sin stock'}
      </p>
      <button
        class="btn btn-primario btn-agregar"
        data-id="${libro.id}"
        ${libro.stock <= 0 ? 'disabled' : ''}
      >
        🛒 Agregar al carrito
      </button>
    </div>
  `;

  // Evento del botón agregar
  div.querySelector('.btn-agregar').addEventListener('click', () => {
    agregarAlCarritoDB(libro.id);
  });

  return div;
}

// ══════════════════════════════════════════════════
//  📄 PAGINACIÓN
// ══════════════════════════════════════════════════

function renderizarPaginacion() {
  const totalPaginas = Math.ceil(librosFiltrados.length / LIBROS_POR_PAGINA);
  paginacionDiv.innerHTML = '';

  if (totalPaginas <= 1) return;

  // Botón anterior
  const btnAnterior = document.createElement('button');
  btnAnterior.textContent = '← Anterior';
  btnAnterior.classList.add('btn-pagina');
  btnAnterior.disabled = paginaActual === 1;
  btnAnterior.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      cargarProductos();
      scrollToCatalogo();
    }
  });
  paginacionDiv.appendChild(btnAnterior);

  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    const btnNum = document.createElement('button');
    btnNum.textContent = i;
    btnNum.classList.add('btn-pagina');
    if (i === paginaActual) btnNum.classList.add('activo');
    btnNum.addEventListener('click', () => {
      paginaActual = i;
      cargarProductos();
      scrollToCatalogo();
    });
    paginacionDiv.appendChild(btnNum);
  }

  // Botón siguiente
  const btnSiguiente = document.createElement('button');
  btnSiguiente.textContent = 'Siguiente →';
  btnSiguiente.classList.add('btn-pagina');
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnSiguiente.addEventListener('click', () => {
    if (paginaActual < totalPaginas) {
      paginaActual++;
      cargarProductos();
      scrollToCatalogo();
    }
  });
  paginacionDiv.appendChild(btnSiguiente);
}

function scrollToCatalogo() {
  document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════
//  🔍 BÚSQUEDA Y FILTRADO
// ══════════════════════════════════════════════════

/**
 * Búsqueda en tiempo real con debounce de 300ms
 */
function iniciarBusquedaAsincrona() {
  busquedaInput.addEventListener('input', () => {
    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(() => {
      const texto     = busquedaInput.value.trim();
      const categoria = categoriaSelect.value;
      buscarLibrosAPI(texto, categoria);
    }, 300);
  });
}

/**
 * Busca libros en la API con texto y categoría
 */
async function buscarLibrosAPI(texto, categoria) {
  try {
    const url = `/api/libros/buscar?q=${encodeURIComponent(texto)}&categoria=${categoria}`;
    const respuesta = await fetch(url);
    const datos     = await respuesta.json();

    if (datos.status === 'success') {
      librosFiltrados = datos.data.libros;
      paginaActual    = 1;
      cargarProductos();
    }
  } catch (error) {
    console.error('❌ Error en búsqueda:', error.message);
    // Fallback: filtrar localmente
    filtrarLocal(texto, categoria);
  }
}

/**
 * Filtrado local como respaldo si la API falla
 */
function filtrarLocal(texto, categoria) {
  const textoLower = texto.toLowerCase();
  librosFiltrados = todosLosLibros.filter(libro => {
    const coincideTexto =
      !texto ||
      libro.titulo.toLowerCase().includes(textoLower) ||
      (libro.autor && libro.autor.toLowerCase().includes(textoLower));
    const coincideCategoria =
      categoria === 'todas' || libro.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });
  paginaActual = 1;
  cargarProductos();
}

/**
 * Filtrar al cambiar el select de categoría
 */
function filtrarPorCategoria() {
  const texto     = busquedaInput.value.trim();
  const categoria = categoriaSelect.value;
  buscarLibrosAPI(texto, categoria);
}

// ══════════════════════════════════════════════════
//  🛒 CARRITO — CONECTADO A LA BASE DE DATOS
// ══════════════════════════════════════════════════

async function agregarAlCarritoDB(id) {
  if (!usuarioActual) {
    mostrarToast('⚠️ Debes iniciar sesión para agregar al carrito', 'advertencia');
    abrirModalLogin();
    return;
  }

  try {
    const respuesta = await fetch('/api/carrito/agregar', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id_libro: id, cantidad: 1 })
    });
    const datos = await respuesta.json();

    if (datos.status === 'success') {
      mostrarToast(`✅ ${datos.mensaje || 'Libro agregado al carrito'}`, 'exito');
      await actualizarContadorCarritoDB();
    } else {
      mostrarToast(`⚠️ ${datos.mensaje || 'No se pudo agregar'}`, 'error');
    }
  } catch (error) {
    console.error('❌ Error al agregar al carrito:', error.message);
    mostrarToast('❌ Error al conectar con el servidor', 'error');
  }
}

async function actualizarContadorCarritoDB() {
  try {
    const respuesta = await fetch('/api/carrito');
    const datos     = await respuesta.json();
    if (datos.status === 'success') {
      contadorCarrito.textContent = datos.data.cantidad || 0;
    }
  } catch (error) {
    console.error('❌ Error al actualizar contador:', error.message);
  }
}

async function mostrarCarritoDB() {
  try {
    const respuesta = await fetch('/api/carrito');
    const datos     = await respuesta.json();

    if (datos.status === 'success') {
      const { items, total } = datos.data;

      if (!items || items.length === 0) {
        carritoItems.innerHTML = '';
        carritoVacio.classList.remove('oculto');
        carritoTotal.textContent = '0.00';
      } else {
        carritoVacio.classList.add('oculto');
        carritoItems.innerHTML = items.map(item => `
          <div class="carrito-item">
            <img
              src="${item.imagen || 'img/libros-img/default.webp'}"
              alt="${item.titulo}"
              class="carrito-item-imagen"
              onerror="this.src='img/libros-img/default.webp'"
            >
            <div class="carrito-item-detalles">
              <h4 class="carrito-item-titulo">${item.titulo}</h4>
              <p class="carrito-item-precio">$${parseFloat(item.precio_unit).toFixed(2)}</p>
              <div class="carrito-item-cantidad">
                <span>Cantidad: ${item.cantidad}</span>
              </div>
            </div>
            <span
              class="eliminar-item"
              data-id="${item.id_libro}"
              title="Eliminar"
            >&times;</span>
          </div>
        `).join('');

        carritoTotal.textContent = parseFloat(total).toFixed(2);

        // Eventos eliminar
        document.querySelectorAll('.eliminar-item').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const idLibro = parseInt(e.target.dataset.id);
            await eliminarDelCarritoDB(idLibro);
            await mostrarCarritoDB();
            await actualizarContadorCarritoDB();
          });
        });
      }
    }
  } catch (error) {
    console.error('❌ Error al mostrar carrito:', error.message);
  }

  modalCarrito.classList.remove('oculto');
}

async function eliminarDelCarritoDB(idLibro) {
  try {
    const respuesta = await fetch(`/api/carrito/eliminar/${idLibro}`, {
      method: 'DELETE'
    });
    const datos = await respuesta.json();
    if (datos.status === 'success') {
      mostrarToast('🗑️ Libro eliminado del carrito', 'exito');
    }
  } catch (error) {
    console.error('❌ Error al eliminar del carrito:', error.message);
  }
}

async function vaciarCarritoDB() {
  try {
    const respuesta = await fetch('/api/carrito/vaciar', { method: 'DELETE' });
    const datos     = await respuesta.json();
    if (datos.status === 'success') {
      mostrarToast('🗑️ Carrito vaciado', 'exito');
      await mostrarCarritoDB();
      await actualizarContadorCarritoDB();
    }
  } catch (error) {
    console.error('❌ Error al vaciar carrito:', error.message);
  }
}

// ══════════════════════════════════════════════════
//  👤 AUTENTICACIÓN
// ══════════════════════════════════════════════════

async function verificarSesion() {
  try {
    const respuesta = await fetch('/api/auth/sesion');
    const datos     = await respuesta.json();

    if (datos.status === 'success' && datos.data.usuario) {
      usuarioActual = datos.data.usuario;
      actualizarUIUsuario();
      await actualizarContadorCarritoDB();
    }
  } catch (error) {
    console.error('❌ Error al verificar sesión:', error.message);
  }
}

function actualizarUIUsuario() {
  if (usuarioActual) {
    nombreUsuario.textContent = usuarioActual.nombre || usuarioActual.email;
    btnLogout.classList.remove('oculto');
  } else {
    nombreUsuario.textContent = 'Iniciar sesión';
    btnLogout.classList.add('oculto');
    contadorCarrito.textContent = '0';
  }
}

async function login(email, password) {
  try {
    const respuesta = await fetch('/api/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password })
    });
    const datos = await respuesta.json();

    if (datos.status === 'success') {
      usuarioActual = datos.data.usuario;
      actualizarUIUsuario();
      cerrarModalLogin();
      mostrarToast(`✅ ¡Bienvenido, ${usuarioActual.nombre || usuarioActual.email}!`, 'exito');
      await actualizarContadorCarritoDB();
    } else {
      errorLogin.textContent = datos.mensaje || 'Credenciales incorrectas';
      errorLogin.classList.remove('oculto');
    }
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    errorLogin.textContent = 'Error al conectar con el servidor';
    errorLogin.classList.remove('oculto');
  }
}

async function registro(nombre, email, password) {
  try {
    const respuesta = await fetch('/api/auth/registro', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nombre, email, password })
    });
    const datos = await respuesta.json();

    if (datos.status === 'success') {
      usuarioActual = datos.data.usuario;
      actualizarUIUsuario();
      cerrarModalLogin();
      mostrarToast(`✅ ¡Cuenta creada! Bienvenido, ${usuarioActual.nombre}!`, 'exito');
    } else {
      errorRegistro.textContent = datos.mensaje || 'No se pudo crear la cuenta';
      errorRegistro.classList.remove('oculto');
    }
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    errorRegistro.textContent = 'Error al conectar con el servidor';
    errorRegistro.classList.remove('oculto');
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    usuarioActual = null;
    actualizarUIUsuario();
    mostrarToast('👋 Sesión cerrada correctamente', 'exito');
    contadorCarrito.textContent = '0';
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error.message);
  }
}

// ══════════════════════════════════════════════════
//  🪟 MODALES
// ══════════════════════════════════════════════════

function abrirModalLogin() {
  modalLogin.classList.remove('oculto');
  mostrarFormLogin();
}

function cerrarModalLogin() {
  modalLogin.classList.add('oculto');
  formLogin.reset();
  formRegistro.reset();
  errorLogin.classList.add('oculto');
  errorRegistro.classList.add('oculto');
}

function mostrarFormLogin() {
  formLogin.classList.remove('oculto');
  formRegistro.classList.add('oculto');
  tabLogin.classList.add('activo');
  tabRegistro.classList.remove('activo');
}

function mostrarFormRegistro() {
  formRegistro.classList.remove('oculto');
  formLogin.classList.add('oculto');
  tabRegistro.classList.add('activo');
  tabLogin.classList.remove('activo');
}

// ══════════════════════════════════════════════════
//  🔔 TOAST (mensajes flotantes)
// ══════════════════════════════════════════════════

function mostrarToast(mensaje, tipo = 'exito') {
  toast.textContent = mensaje;
  toast.className   = `toast toast-${tipo}`;
  toast.classList.remove('oculto');

  setTimeout(() => {
    toast.classList.add('oculto');
  }, 3000);
}

// ══════════════════════════════════════════════════
//  🎛️ REGISTRO DE EVENTOS
// ══════════════════════════════════════════════════

function registrarEventos() {

  // ── Búsqueda con botón ──
  btnBuscar.addEventListener('click', () => {
    buscarLibrosAPI(busquedaInput.value.trim(), categoriaSelect.value);
  });

  // ── Buscar al presionar Enter ──
  busquedaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      buscarLibrosAPI(busquedaInput.value.trim(), categoriaSelect.value);
    }
  });

  // ── Filtro por categoría ──
  categoriaSelect.addEventListener('change', filtrarPorCategoria);

  // ── Abrir carrito ──
  carritoIcono.addEventListener('click', () => {
    if (!usuarioActual) {
      mostrarToast('⚠️ Debes iniciar sesión para ver el carrito', 'advertencia');
      abrirModalLogin();
      return;
    }
    mostrarCarritoDB();
  });

  // ── Cerrar carrito ──
  cerrarCarrito.addEventListener('click', () => {
    modalCarrito.classList.add('oculto');
  });

  // ── Vaciar carrito ──
  vaciarCarritoBtn.addEventListener('click', vaciarCarritoDB);

  // ── Pagar ──
  pagarBtn.addEventListener('click', () => {
    mostrarToast('🚧 Módulo de pago en construcción', 'advertencia');
  });

  // ── Cerrar modales al hacer clic fuera ──
  window.addEventListener('click', (e) => {
    if (e.target === modalCarrito) modalCarrito.classList.add('oculto');
    if (e.target === modalLogin)  cerrarModalLogin();
  });

  // ── Login / Logout ──
  btnAbrirLogin.addEventListener('click', () => {
    if (usuarioActual) return; // ya está logueado
    abrirModalLogin();
  });

  btnLogout.addEventListener('click', logout);

  cerrarLogin.addEventListener('click', cerrarModalLogin);

  // ── Tabs del modal auth ──
  tabLogin.addEventListener('click',    mostrarFormLogin);
  tabRegistro.addEventListener('click', mostrarFormRegistro);

  // ── Submit Login ──
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    await login(email, password);
  });

  // ── Submit Registro ──
  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre   = document.getElementById('reg-nombre').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    await registro(nombre, email, password);
  });

  // ── Suscripción footer ──
  document.getElementById('btn-suscribir').addEventListener('click', () => {
    const email = document.getElementById('email-suscripcion').value.trim();
    if (email) {
      mostrarToast(`📧 ¡Gracias por suscribirte con ${email}!`, 'exito');
      document.getElementById('email-suscripcion').value = '';
    } else {
      mostrarToast('⚠️ Ingresa un email válido', 'advertencia');
    }
  });
}