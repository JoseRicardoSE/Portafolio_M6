import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

export async function leerJSON(archivo) {
  try {
    const ruta = path.join(DATA_DIR, archivo);
    const contenido = await fs.readFile(ruta, 'utf-8');
    return JSON.parse(contenido);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('Archivo no encontrado: ' + archivo);
    }
    throw new Error('Error al leer ' + archivo);
  }
}

export async function escribirJSON(archivo, datos) {
  try {
    const ruta = path.join(DATA_DIR, archivo);
    await fs.writeFile(ruta, JSON.stringify(datos, null, 2), 'utf-8');
  } catch (error) {
    throw new Error('Error al escribir ' + archivo);
  }
}
