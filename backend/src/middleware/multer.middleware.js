import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ 
    storage:storage , 
    limits: { fileSize: 1 * 1024 * 1024 , files:4},
    fileFilter:(req, file, cb) =>{
        if(file.mimetype.startsWith('image/')){
            const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg','image/webp'];
            if(allowedFormats.includes(file.mimetype)){
                cb(null, true);
            } else {
                cb(new Error('Invalid file format'), false);
            }
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
}); 

export { upload };