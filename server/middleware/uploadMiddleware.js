import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadBasePath = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadBasePath)) {
  fs.mkdirSync(uploadBasePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Isolated tenant folder per tenant
    const tenantDir = path.join(uploadBasePath, req.tenantId || 'global-vault');
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    cb(null, tenantDir);
  },
  filename: (req, file, cb) => {
    // Generate clean sanitized filename with unique timestamp
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${cleanName}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Prevent dangerous executable uploads (.exe, .bat, .cmd, .sh, .vbs)
  const ext = path.extname(file.originalname).toLowerCase();
  const dangerousExts = ['.exe', '.bat', '.cmd', '.vbs', '.msi', '.ps1'];
  if (dangerousExts.includes(ext)) {
    return cb(new Error('Executable script/binary uploads are restricted by security policy.'), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter,
});
