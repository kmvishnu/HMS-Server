import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/AppError';

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB
  }
});

const memoryStorage = multer.memoryStorage();

export const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1 MB limit for base64 images
  }
});

export const uploadHotelImages = upload;
export const uploadRoomTypeImage = upload;
