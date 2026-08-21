// ============================================
// CARRITO DE COMPRAS - El Túnel
// ============================================

const Carrito = {

  // 📦 Obtener carrito del localStorage
  obtener() {
    const data = localStorage.getItem('carrito');
    return data ? JSON.parse(data) : [];
  },

  // 💾 Guardar carrito en localStorage
  guardar(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    this.actualizarContador();
  },

  // ➕ Agregar libro al carrito
  agregar(libro) {
    const carrito = this.obtener();
    const existente = carrito.find(item => item.id === libro.id);

    if (existente) {
      // Si ya existe, aumentar cantidad (sin pasar el stock)
      if (existente.cantidad < libro.stock) {
        existente.cantidad += 1;
        this.guardar(carrito);
        this.mostrarNotificacion(`"${libro.titulo}" actualizado en el carrito`);
      } else {
        this.mostrarNotificacion(`⚠️ Stock máximo alcanzado para "${libro.titulo}"`, 'error');
        return;
      }
    } else {
      // Si no existe, agregar con cantidad 1
      carrito.push({
        id: libro.id,
        titulo: libro.titulo,
        autor: libro.autor,
        precio: parseFloat(libro.precio),
        imagen: libro.imagen,
        stock: libro.stock,
        cantidad: 1
      });
      this.guardar(carrito);
      this.mostrarNotificacion(`✅ "${libro.titulo}" agregado al carrito`);
    }
  },

  // ➖ Reducir cantidad o eliminar
  reducir(id) {
    let carrito = this.obtener();
    const item = carrito.find(i => i.id === id);
    if (!item) return;

    if (item.cantidad > 1) {
      item.cantidad -= 1;
    } else {
      carrito = carrito.filter(i => i.id !== id);
    }
    this.guardar(carrito);
  },

  // 🗑️ Eliminar libro del carrito
  eliminar(id) {
    let carrito = this.obtener().filter(item => item.id !== id);
    this.guardar(carrito);
  },

  // 🧹 Vaciar carrito completo
  vaciar() {
    localStorage.removeItem('carrito');
    this.actualizarContador();
  },

  // 🔢 Contar total de items
  contarItems() {
    return this.obtener().reduce((total, item) => total + item.cantidad, 0);
  },

  // 💰 Calcular total
  calcularTotal() {
    return this.obtener()
      .reduce((total, item) => total + (item.precio * item.cantidad), 0)
      .toFixed(2);
  },

  // 🔄 Actualizar contador en el navbar
  actualizarContador() {
    const contador = document.getElementById('carrito-contador');
    if (contador) {
      const total = this.contarItems();
      contador.textContent = total;
      contador.style.display = total > 0 ? 'flex' : 'none';
    }
  },

  // 🔔 Mostrar notificación temporal
  mostrarNotificacion(mensaje, tipo = 'success') {
    // Eliminar notificación anterior si existe
    const anterior = document.getElementById('notificacion-carrito');
    if (anterior) anterior.remove();

    const notif = document.createElement('div');
    notif.id = 'notificacion-carrito';
    notif.className = `notificacion-carrito ${tipo}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    // Mostrar con animación
    setTimeout(() => notif.classList.add('visible'), 10);

    // Ocultar después de 2.5 segundos
    setTimeout(() => {
      notif.classList.remove('visible');
      setTimeout(() => notif.remove(), 300);
    }, 2500);
  }
};

// Actualizar contador al cargar cualquier página
document.addEventListener('DOMContentLoaded', () => {
  Carrito.actualizarContador();
});