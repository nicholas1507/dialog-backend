require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const {v4: uuidv4} = require('uuid');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createUploadMiddleware = ((folderGenerator) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/msword'
    ];
    return multer({
        storage: new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async(req,file) => {
                return {
                folder: folderGenerator(req,file),
                allowed_formats : allowedFormats = ['jpg', 'png', 'jpeg', 'gif', 'pdf', 'docx', 'doc'],
                resource_type: 'auto',
                public_id: uuidv4()
                }
            }
            
        }),
        fileFilter: (req, file, cb) => {
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Format file available only image, PDF, and Word (.doc/.docx).'), false);
            }
        },
        limits: {fileSize: 5 * 1024 * 1024}
    })
});
const uploadProfile = createUploadMiddleware((req) => {
    const userId = req.user?.id || "default";
    return `marketplace_penerjemah/profile/${userId}`
});
const uploadPayment = createUploadMiddleware((req) => {
    // const userId = req.user?.id || "default";
    return `marketplace_penerjemah/payment`
});
const sourceDoc = createUploadMiddleware((req) => {
    return `marketplace_penerjemah/project/temp/source`;
});
const translatedDoc = createUploadMiddleware((req) => {
    const projectId = req.params.projectId;
    return `marketplace_penerjemah/project/${projectId}/result`;
});

module.exports = {cloudinary, uploadProfile,sourceDoc,translatedDoc,uploadPayment};