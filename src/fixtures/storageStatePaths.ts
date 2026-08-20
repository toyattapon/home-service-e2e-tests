import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.join(__dirname, '..', '..', 'playwright', '.auth');

export const ADMIN_STORAGE_STATE = path.join(authDir, 'admin.json');
export const TECH_STORAGE_STATE = path.join(authDir, 'technician.json');
