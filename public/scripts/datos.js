/*
  PROYECTO FINAL DE SISTEMAS WEB - ESCUELA DE CÓDIGO
  Datos de los libros disponibles en la tienda
  Versión: 1.0
  Elaboró: JLLM
*/

// Array con todos los libros del catálogo
// Cada libro tiene: id, título, autor, precio, categoría, stock e imagen
const libros = [
  {
    id: 1,
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    precio: 480.00,
    categoria: "novela",
    stock: 15,
    imagen: "./img/libros-img/CienASoledad.jpg"
  },
  {
    id: 2,
    titulo: "1984",
    autor: "George Orwell",
    precio: 240.00,
    categoria: "novela",
    stock: 10,
    imagen: "./img/libros-img/1984.webp"
  },
  {
    id: 3,
    titulo: "El principito",
    autor: "Antoine de Saint-Exupéry",
    precio: 140.00,
    categoria: "infantil",
    stock: 20,
    imagen: "./img/libros-img/principito.webp"
  },
  {
    id: 4,
    titulo: "Breve historia del tiempo",
    autor: "Stephen Hawking",
    precio: 369.50,
    categoria: "ciencia",
    stock: 5,
    imagen: "./img/libros-img/BHTiempo.webp"
  },
  {
    id: 5,
    titulo: "La sombra del viento",
    autor: "Carlos Ruiz Zafón",
    precio: 498.00,
    categoria: "novela",
    stock: 8,
    imagen: "./img/libros-img/sombraviento.webp"
  },
  {
    id: 6,
    titulo: "Grandes ideas de la ciencia",
    autor: "Isaac Asimov",
    precio: 295.00,
    categoria: "ciencia",
    stock: 12,
    imagen: "./img/libros-img/ideasciencia.webp"
  },
  {
    id: 7,
    titulo: "Harry Potter y la piedra filosofal",
    autor: "J.K. Rowling",
    precio: 389.00,
    categoria: "fantasia",
    stock: 25,
    imagen: "./img/libros-img/HarryPotter.jpg"
  },
  {
    id: 8,
    titulo: "El Hobbit",
    autor: "J.R.R. Tolkien",
    precio: 288.00,
    categoria: "fantasia",
    stock: 7,
    imagen: "./img/libros-img/hobbit.webp"
  },
  {
    id: 9,
    titulo: "Cosmos",
    autor: "Carl Sagan",
    precio: 399.00,
    categoria: "ciencia",
    stock: 6,
    imagen: "./img/libros-img/cosmos.webp"
  },
  {
    id: 10,
    titulo: "Don Quijote de la Mancha",
    autor: "Miguel de Cervantes",
    precio: 399.00,
    categoria: "novela",
    stock: 10,
    imagen: "./img/libros-img/quijote.webp"
  },
  {
    id: 11,
    titulo: "Matilda",
    autor: "Roald Dahl",
    precio: 249.00,
    categoria: "infantil",
    stock: 15,
    imagen: "./img/libros-img/matilda.webp"
  },
  {
    id: 12,
    titulo: "Los juegos del hambre",
    autor: "Suzanne Collins",
    precio: 499.00,
    categoria: "fantasia",
    stock: 10,
    imagen: "./img/libros-img/juegosdelhambre.webp"
  },
  {
    id: 13,
    titulo: "El Gran Gatsby",
    autor: "Francis Scott Fitzgerald",
    precio: 547.50,
    categoria: "novela",
    stock: 9,
    imagen: "./img/libros-img/GranGat.webp"
  },
  {
    id: 14,
    titulo: "Como agua para chocolate",
    autor: "Laura Esquivel",
    precio: 319.00,
    categoria: "novela",
    stock: 8,
    imagen: "./imagenes/libros-img/AguaChocolate.jpg"
  },
  {
    id: 15,
    titulo: "Una habitación propia",
    autor: "Virginia Woolf",
    precio: 199.00,
    categoria: "novela",
    stock: 10,
    imagen: "./img/libros-img/habitacionpropia.webp"
  },
  {
    id: 16,
    titulo: "Los recuerdos del porvenir",
    autor: "Elena Garro",
    precio: 429.00,
    categoria: "novela",
    stock: 8,
    imagen: "./img/libros-img/recuerdosporvenir.jpg"
  },
  {
    id: 17,
    titulo: "Arráncame la vida",
    autor: "Ángeles Mastretta",
    precio: 368.00,
    categoria: "novela",
    stock: 9,
    imagen: "./img/libros-img/arrancamelavida.webp"
  },
  {
    id: 18,
    titulo: "El cuento de la criada",
    autor: "Margaret Atwood",
    precio: 559.00,
    categoria: "novela",
    stock: 11,
    imagen: "./img/libros-img/cuentodelacriada.webp"
  },
  {
    id: 19,
    titulo: "Hasta no verte Jesús mío",
    autor: "Elena Poniatowska",
    precio: 428.00,
    categoria: "novela",
    stock: 5,
    imagen: "./img/libros-img/hastanovertejesusmio.webp"
  },
  {
    id: 20,
    titulo: "El libro de la selva",
    autor: "Rudyard Kipling",
    precio: 249.00,
    categoria: "infantil",
    stock: 6,
    imagen: "./img/libros-img/librodelaselva.webp"
  }
];