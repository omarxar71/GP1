import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryInstance from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryInstance, 
    params: {
        folder: 'HireBridge/CVs',
        resource_type: 'raw', 
        
        // This function forces Cloudinary to save the file with its original name AND extension
        public_id: (req, file) => {
            // 1. Extract the name (e.g., "backend-cv")
            const originalName = file.originalname.split('.')[0];
            
            // 2. Extract the extension (e.g., "pdf")
            const extension = file.originalname.split('.').pop();
            
            // 3. Create a unique suffix so candidates with the same filename don't overwrite each other
            const uniqueSuffix = Date.now();
            
            // 4. Combine them: "backend-cv-1713998400.pdf"
            return `${originalName}-${uniqueSuffix}.${extension}`;
        }
    }
});

export const uploadCV = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});