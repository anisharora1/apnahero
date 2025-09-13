import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import {Readable} from 'stream'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET_KEY
});

// Upload an image
const uploadOnCloudinary = async (fileBuffer, originalName) => {
    try {
        if(!fileBuffer) return null;

        return new Promise((resolve, reject)=>{
            const uploadStream= cloudinary.uploader.upload_stream({
                resource_type: 'image',
                public_id: `uploads/${Date.now()}_${originalName}`
            }, (error, result) => {
                if (error) {
                    console.error("Error uploading image:", error);
                    return reject(error);
                }
                //console.log("Image uploaded successfully:", result);
                resolve(result);
            });

            const stream = Readable.from(fileBuffer);
            stream.pipe(uploadStream);
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        return null;
    }
};

export {uploadOnCloudinary}