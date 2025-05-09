const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'studymate_uploads',
    resource_type: 'raw',
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'xlsx', 'csv', 'sql', 'txt', 'zip', 'mp4'],
    type: 'upload', // ✅ Not private, not authenticated, just "upload"
    transformation: [{ width: 500, height: 500, crop: "limit" }], // optional
  },
});

const parser = multer({ storage });

module.exports = parser;
// finsihed set up