import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET 
});

const uploadImage = async (file) => {
  try {
    const res = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
      folder: 'chat'
    });
    return res;
  } catch (error) {
    throw new Error(error.message)
  }
}

export default uploadImage;