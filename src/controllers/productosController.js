import { v4 as uuidv4 } from 'uuid';
import { leerJSON, escribirJSON } from '../helpers/fileSystem.js';

const ARCHIVO = 'productos.json';

// GET /productos
export async function getProductos(req, res) {
  try {
    const productos = await leerJSON(ARCHIVO);
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /producto
export async function createProducto(req, res) {
  try {
    const { title, price, stock, image } = req.body;

    if (!title || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Faltan campos: title, price, stock' });
    }

    const productos = await leerJSON(ARCHIVO);
    const nuevoProducto = {
      id: uuidv4(),
      title,
      price: Number(price),
      stock: Number(stock),
      image: image || ''
    };

    productos.push(nuevoProducto);
    await escribirJSON(ARCHIVO, productos);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /producto (id en el body)
export async function updateProducto(req, res) {
  try {
    const { id, title, price, stock, image } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Se requiere id en el body' });
    }

    const productos = await leerJSON(ARCHIVO);
    const index = productos.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (title !== undefined) productos[index].title = title;
    if (price !== undefined) productos[index].price = Number(price);
    if (stock !== undefined) productos[index].stock = Number(stock);
    if (image !== undefined) productos[index].image = image;

    await escribirJSON(ARCHIVO, productos);
    res.status(200).json(productos[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /producto (id en query o body)
export async function deleteProducto(req, res) {
  try {
    const id = req.query.id || req.body?.id;

    if (!id) {
      return res.status(400).json({ error: 'Se requiere id' });
    }

    const productos = await leerJSON(ARCHIVO);
    const index = productos.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const eliminado = productos.splice(index, 1)[0];
    await escribirJSON(ARCHIVO, productos);
    res.status(200).json({ mensaje: 'Eliminado', producto: eliminado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
