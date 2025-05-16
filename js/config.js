export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export const getCloudinaryUrl = (publicId, type = 'video') => {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/${type}/upload/v1/${publicId}`;
};

