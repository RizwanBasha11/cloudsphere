import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'data', 'cloudsphere.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

const hashedPassword = bcrypt.hashSync('dileep65', 10);

data.users[0].name = 'Meesala Dileep Kumar';
data.users[0].email = 'dileep@cloudsphere.io';
data.users[0].password = hashedPassword;

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Admin user updated successfully to:');
console.log('  Name:    ', data.users[0].name);
console.log('  Email:   ', data.users[0].email);
console.log('  Hash prefix: ', data.users[0].password.slice(0, 10));
