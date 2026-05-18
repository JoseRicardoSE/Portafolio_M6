import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
} from './controllers/productosController.js';
import { getVentas, createVenta } from './controllers/ventasController.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/vendor/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/productos', getProductos);
app.post('/producto', createProducto);
app.put('/producto', updateProducto);
app.delete('/producto', deleteProducto);

app.get('/ventas', getVentas);
app.post('/venta', createVenta);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log('Servidor en http://localhost:' + PORT);
});
