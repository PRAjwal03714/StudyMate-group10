const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { uploadInstructorFile } = require('../middlewares/uploadMiddleware');
const parser = require('../middlewares/uploadCloudinary');

router.post('/folder/create', fileController.createFolder);
// router.post('/upload', uploadInstructorFile.single('file'), fileController.uploadFile);
router.post('/upload', parser.single('file'), fileController.uploadFile);

router.get('/:courseId', fileController.getFilesAndFolders);
router.delete('/:fileId', fileController.deleteFile);
router.delete('/folder/:folderId', fileController.deleteFolder);

module.exports = router;
