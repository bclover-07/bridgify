import multer from 'multer';

// Use memory storage for processing files directly in memory (e.g. sending to Cloudinary or Otari)
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow basic document and image types
    const allowedMimes = [
      'application/pdf', 
      'text/csv', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  }
});

// For parsing JSON bodies, we already have express.json(), but if we need a specialized 
// upload handler for arrays, etc., we can export it here.
export default upload;
