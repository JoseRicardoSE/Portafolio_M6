import { v4 as uuidv4 } from 'uuid';
import { leerJSON, escribirJSON } from '../helpers/fileSystem.js';

const ARCHIVO_VENTAS = 'ventas.json';
const ARCHIVO_PRODUCTOS = 'productos.json';

// GET /ventas
export async function getVentas(req, res) {
  try {
    const ventas = await leerJSON(ARCHIVO_VENTAS);
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// POST /venta
export async function createVenta(req, res) {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere items en el body' });
    }

    const productos = await leerJSON(ARCHIVO_PRODUCTOS);
    const ventas = await leerJSON(ARCHIVO_VENTAS);

    for (const item of items) {
      const producto = productos.find(p => String(p.id) === String(item.id));
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado: ' + item.id });
      }
      if (producto.stock < item.quantity) {
        return res.status(400).json({ error: 'Sin stock para ' + producto.title });
      }
    }

    const detalle = [];
    for (const item of items) {
      const producto = productos.find(p => String(p.id) === String(item.id));
      producto.stock -= item.quantity;
      detalle.push({
        productoId: producto.id,
        title: producto.title,
        price: producto.price,
        quantity: item.quantity,
        subtotal: producto.price * item.quantity
      });
    }

    let total = 0;
    for (const d of detalle) {
      total += d.subtotal;
    }

    const nuevaVenta = {
      id: uuidv4(),
      fecha: new Date().toISOString(),
      detalle,
      total
    };

    ventas.push(nuevaVenta);
    await escribirJSON(ARCHIVO_VENTAS, ventas);
    await escribirJSON(ARCHIVO_PRODUCTOS, productos);

    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
