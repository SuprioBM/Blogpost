const { v2: Cloudinary } = require("cloudinary");

Cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRECT,
});

module.exports = Cloudinary;
