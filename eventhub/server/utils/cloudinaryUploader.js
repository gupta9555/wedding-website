const cloudinary = require('../config/cloudinary');

// Uploads a single in-memory buffer (from multer's memoryStorage) to Cloudinary
// using an upload stream, and resolves with { secure_url, public_id }.
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `eventhub/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Convenience wrapper for uploading several files (from multer's .array()) in parallel.
const uploadMultipleToCloudinary = (files, folder) => {
  return Promise.all(files.map((file) => uploadBufferToCloudinary(file.buffer, folder)));
};

module.exports = { uploadBufferToCloudinary, uploadMultipleToCloudinary };
