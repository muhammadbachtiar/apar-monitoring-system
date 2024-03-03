import cloudinaryUpload from './cloudinaryUpload'

async function UploadMultipleFile (files: any[]): Promise<Array<{ fileName: string, fileLink: string, fileId: string }>> {
  const uploadPromises = files.map(async (file) => {
    try {
      const cloudinaryResult = await cloudinaryUpload(file)
      return { fileName: file.originalname, fileLink: cloudinaryResult.secure_url, fileId: cloudinaryResult.public_id }
    } catch (error) {
      console.error(`Error uploading ${file.originalname}:`, error)
      return null
    }
  })

  const results = await Promise.all(uploadPromises)

  const successfulResults = results.filter((result) => result !== null) as Array<{ fileName: string, fileLink: string, fileId: string }>

  return successfulResults
}

export default UploadMultipleFile
