import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(filePath, options = {}) {
  const defaults = {
    folder: 'bridgify',
    resource_type: 'auto',
    ...options,
  };

  try {
    const result = await cloudinary.uploader.upload(filePath, defaults);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message);
    throw error;
  }
}

export async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete failed:', error.message);
  }
}

export default cloudinary;
