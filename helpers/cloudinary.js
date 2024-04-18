import { v2 as cloudinary } from "cloudinary";

const {CLOUD_NAME, CLOUD_API, CLOUD_SECRET} = process.env;

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API,
    api_secret: CLOUD_SECRET
});

export default cloudinary;
