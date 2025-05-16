import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadVideo = async (videoPath, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(videoPath, {
      resource_type: "video",
      public_id: publicId,
      eager: [
        { format: "mp4", quality: "auto" }
      ]
    });
    console.log(`Uploaded ${videoPath}:`, result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${videoPath}:`, error);
  }
};

// Upload your videos
uploadVideo('./assets/videos/Peralada-Resort-Video.mp4', 'peralada-resort');
uploadVideo('./assets/videos/dunhill-links-video.mp4', 'dunhill-links');