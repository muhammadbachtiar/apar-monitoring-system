import cloudinary from '../config/cloudinaryConfig'
interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

async function cloudinaryUpload (file: any): Promise<CloudinaryUploadResult> {
  return await new Promise((resolve, reject) => {
    const filebase64 = file.buffer.toString('base64')
    const finalFile = `data:${file.mimetype};base64,${filebase64}`
    cloudinary.uploader.upload(finalFile, (err: any, result: CloudinaryUploadResult) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
};

export default cloudinaryUpload
