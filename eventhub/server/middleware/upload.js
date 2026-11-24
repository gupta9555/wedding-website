const multer = require('multer');
const ErrorResponse = require('../utils/errorResponse');

// We use memory storage (not disk) because every uploaded file is streamed
// straight to Cloudinary and never needs to touch the server's filesystem —
// this also makes the app safe to run on hosts with ephemeral/read-only disks.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new ErrorResponse('Only image files are allowed', 400), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

module.exports = upload;
