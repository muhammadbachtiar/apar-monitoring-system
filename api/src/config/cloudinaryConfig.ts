const cloudinary = require('cloudinary').v2
require('dotenv').config()

cloudinary.config({
  cloud_name: 'dwprvigp0',
  api_key: '592683883864458',
  api_secret: 'm_uWXxbQP5QxVa2Ed-TPbfFXggk'
})

export default cloudinary
