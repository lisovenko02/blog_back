import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const {CLOUD_NAME, CLOUD_API, CLOUD_SECRET} = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API,
    api_secret: CLOUD_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

export const uploadCloud = multer({ storage });