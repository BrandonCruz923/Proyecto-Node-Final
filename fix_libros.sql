
SET client_encoding = 'UTF8';

UPDATE libros SET 
    titulo = 'Cien Años de Soledad',
    autor  = 'Gabriel García Márquez'
WHERE id = 1;

UPDATE libros SET 
    autor  = 'Antoine de Saint-Exupéry'
WHERE id = 2;

UPDATE libros SET 
    autor  = 'Carlos Ruiz Zafón'
WHERE id = 8;

-- Verificar resultado
SELECT id, titulo, autor FROM libros ORDER BY id;