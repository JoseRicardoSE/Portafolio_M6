# Tienda Rey Rick 
# Autor José Ricardo Salgado Escalona

Proyecto de tienda online con Node.js, Express y Bootstrap 5.
La idea es conectar el backend usando Node.js con el frontend.

## Instalación
En la terminal:

1. Ejecuta `npm install`
2. Ejecuta `npm run dev`
3. Abre `http://localhost:3000`

## Qué hace

- Muestra productos desde un JSON
- Permite buscar y agregar al carrito
- Actualiza el stock cuando se compra

## Notas

- No necesita base de datos, usa archivos JSON
- Usa Bootstrap para el diseño
- Código en `src/` y frontend en `public/`


## CRUD
usa la extencion `Thunder client` , conectate A puerto: 3000

ver productos con GET: 
http://localhost:3000/productos 

agregar un producto con POST:
http://localhost:3000/producto

actualizar un producto con PUT:
http://localhost:3000/producto

eliminar un producto con DELETE:
http://localhost:3000/producto


ver ventas con GET:
http://localhost:3000/ventas

