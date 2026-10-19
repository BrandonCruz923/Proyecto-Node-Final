
const API = '/api/admin';

const $ = (selector) => document.querySelector(selector);

const escapar = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[caracter]);

const dinero = (valor) =>
  Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN'
  });

function mostrarMensaje(texto, tipo = 'exito') {
  const elemento = $('#mensaje-admin');
  elemento.textContent = texto;
  elemento.className = `mensaje-admin ${tipo}`;
}

async function peticion(ruta, opciones = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    credentials: 'same-origin',
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers
    }
  });

  const resultado = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    if (respuesta.status === 401 || respuesta.status === 403) {
      mostrarMensaje(
        respuesta.message ||
        resultado.message ||
        'Inicia sesión con una cuenta administradora.',
        'error'
      );
    }

    throw new Error(
      resultado.message || `Error del servidor (${respuesta.status})`
    );
  }

  return resultado;
}

async function cargarResumen() {
  const resultado = await peticion('/resumen');
  const datos = resultado.data;

  $('#total-libros').textContent = datos.total_libros;
  $('#total-stock').textContent = datos.unidades_stock;
  $('#total-agotados').textContent = datos.agotados;
}

async function cargarInventario() {
  const resultado = await peticion('/libros');
  const libros = resultado.data.libros;
  const tabla = $('#tabla-inventario');

  if (!libros.length) {
    tabla.innerHTML =
      '<tr><td colspan="4">No hay libros registrados.</td></tr>';
    return;
  }

  tabla.innerHTML = libros.map((libro) => `
    <tr>
      <td>
        <div class="libro-celda">
          ${
            libro.imagen
              ? `<img src="${escapar(libro.imagen)}"
                   alt="" loading="lazy"
                   onerror="this.style.visibility='hidden'">`
              : ''
          }
          <div>
            <strong>${escapar(libro.titulo)}</strong>
            <small>${escapar(libro.autor)}</small>
          </div>
        </div>
      </td>
      <td>${dinero(libro.precio)}</td>
      <td>
        <strong>${libro.stock}</strong>
        ${Number(libro.stock) === 0
          ? '<small> · Agotado</small>'
          : ''}
      </td>
      <td>
        <form class="stock-form" data-id="${libro.id}">
          <input
            type="number"
            name="cantidad"
            min="1"
            step="1"
            required
            aria-label="Unidades que se agregarán"
            placeholder="Unidades">
          <button type="submit" aria-label="Agregar stock">
            +
          </button>
        </form>
      </td>
    </tr>
  `).join('');
}

async function cargarMasVendidos() {
  const resultado = await peticion('/mas-vendidos');
  const libros = resultado.data.libros;
  const tabla = $('#tabla-ventas');

  if (!libros.length) {
    tabla.innerHTML =
      '<tr><td colspan="4">No hay libros registrados.</td></tr>';
    return;
  }

  tabla.innerHTML = libros.map((libro, indice) => `
    <tr>
      <td>${indice + 1}</td>
      <td>
        <div class="libro-celda">
          ${
            libro.imagen
              ? `<img src="${escapar(libro.imagen)}"
                   alt="" loading="lazy"
                   onerror="this.style.visibility='hidden'">`
              : ''
          }
          <div>
            <strong>${escapar(libro.titulo)}</strong>
            <small>${escapar(libro.autor)}</small>
          </div>
        </div>
      </td>
      <td><strong>${libro.unidades_vendidas}</strong></td>
      <td>${dinero(libro.importe_vendido)}</td>
    </tr>
  `).join('');
}

async function actualizarPanel() {
  await Promise.all([
    cargarResumen(),
    cargarInventario(),
    cargarMasVendidos()
  ]);
}

// Registrar libro nuevo
$('#form-libro').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const formulario = evento.currentTarget;
  const boton = formulario.querySelector('button[type="submit"]');
  const datos = Object.fromEntries(new FormData(formulario).entries());

  datos.precio = Number(datos.precio);
  datos.stock = Number(datos.stock);

  boton.disabled = true;

  try {
    const resultado = await peticion('/libros', {
      method: 'POST',
      body: JSON.stringify(datos)
    });

    formulario.reset();
    mostrarMensaje(resultado.message || 'Libro registrado correctamente.');

    await actualizarPanel();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  } finally {
    boton.disabled = false;
  }
});

// Delegación de eventos: agregar unidades a un libro existente
$('#tabla-inventario').addEventListener('submit', async (evento) => {
  const formulario = evento.target.closest('.stock-form');
  if (!formulario) return;

  evento.preventDefault();

  const boton = formulario.querySelector('button');
  const cantidad = Number(new FormData(formulario).get('cantidad'));
  const id = formulario.dataset.id;

  if (!Number.isSafeInteger(cantidad) || cantidad <= 0) {
    mostrarMensaje('Ingresa una cantidad entera mayor que cero.', 'error');
    return;
  }

  boton.disabled = true;

  try {
    const resultado = await peticion(`/libros/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ cantidad })
    });

    mostrarMensaje(
      `${resultado.data.libro.titulo}: nuevo stock ${resultado.data.libro.stock}.`
    );

    await actualizarPanel();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  } finally {
    boton.disabled = false;
  }
});

// Navegación lateral
document.querySelectorAll('.menu-item').forEach((enlace) => {
  enlace.addEventListener('click', () => {
    document.querySelectorAll('.menu-item').forEach((item) => {
      item.classList.remove('activo');
    });

    enlace.classList.add('activo');
  });
});

// Comprobar sesión y cargar información
actualizarPanel().catch((error) => {
  mostrarMensaje(error.message, 'error');
});
